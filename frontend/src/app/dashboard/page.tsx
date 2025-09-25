"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  first_name?: string;
  email: string;
  user_id: number;
  is_sacco_admin: boolean;
}

interface Product {
  id: number;
  name: string;
  product_type: string;
  quantity: number;
  acres: number;
  status: string;
  pid: string;
  qr_code: string | null;
  harvested: boolean;
  stages: ProductStage[];
  feedbacks: Feedback[];
}

interface ProductStage {
  id: number;
  stage_name: string;
  quantity: number;
  location: string | null;
  scanned_qr: boolean;
}

interface Feedback {
  id: number;
  message: string;
  created_at: string;
  product_name?: string;
}

interface Payment {
  id: number;
  product_id: number;
  product_name: string;
  amount: number;
  status: string;
  date: string;
}

const theme = createTheme({
  palette: {
    primary: { main: "#2f855a", contrastText: "#ffffff" },
    secondary: { main: "#1a3c34" },
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

export default function Dashboard() {
  const [farmerName, setFarmerName] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [formData, setFormData] = useState({
    farmerName: "",
    phonenumber: "",
    location: "",
    name: "",
    product_type: "",
    quantity: "",
    acres: "",
  });
  const [newFeedback, setNewFeedback] = useState("");
  const [openTerms, setOpenTerms] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access");
      if (!token) {
        router.push("/login");
        return;
      }
      setAccessToken(token);
      try {
        const decoded: JwtPayload = jwtDecode(token);
        setFarmerName(decoded.first_name || decoded.email || "Farmer");
        fetchProducts();
        fetchPayments(token);
        fetchFeedbacks(token);
      } catch (err) {
        console.error("JWT decode error:", err);
        setError("Invalid session. Please log in again.");
      }
    }
  }, [router]);

const fetchProducts = async () => {
  setError(null);
  const token = await getValidAccessToken();

  if (!token) {
    setError("Session expired. Please log in again.");
    return;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Backend error fetching products:", data);
      setError(data.detail || "Failed to fetch products");
      return;
    }

    const formattedProducts = data.map((p: any) => ({
      id: p.uid,
      name: p.title,
      product_type: p.variety,
      quantity: p.quantity,
      acres: p.acres,
      status: p.status,
      pid: p.pid,
      qr_code: p.qr_code_data,
      harvested: false,
      stages: [],
      feedbacks: [],
    }));

    setProducts(formattedProducts);
  } catch (err) {
    console.error("Error fetching products:", err);
    setError("Failed to load products. Please try again.");
  }
};

const getValidAccessToken = async (): Promise<string | null> => {
  let token = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  if (!token && refresh) {
    try {
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      const refreshData = await refreshRes.json();
      if (!refreshRes.ok) throw new Error(refreshData.detail || "Failed to refresh token");
      token = refreshData.access;
      localStorage.setItem("access", token ?? "");
    } catch (err) {
      console.error("Token refresh failed:", err);
      return null;
    }
  }

  return token;
};

  const fetchPayments = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payments. Please try again.");
    }
  };

  const fetchFeedbacks = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedbacks/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      const data = await res.json();
      setFeedbacks(data || []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setError("Failed to load feedbacks. Please try again.");
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) throw new Error("Failed to refresh token");

    const data = await res.json();
    localStorage.setItem("access", data.access);
    return data.access;
  } catch (err) {
    console.error("Token refresh error:", err);
    return null;
  }
};


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name as string]: typeof value === "string" ? value.trim() : value,
  }));
};

 const getValidToken = async (): Promise<string | null> => {
  const token = localStorage.getItem("access");
  if (!token) return null;
  try {
    // Try decoding to check expiry (assuming exp in seconds)
    const decoded: any = jwtDecode(token);
    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
      // Token expired, try to refresh
      return await refreshAccessToken();
    }
    return token;
  } catch {
    // If decode fails, try to refresh
    return await refreshAccessToken();
  }
};

const handleSubmitProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  const { name, product_type, quantity, acres } = formData;
  if (!name || !product_type || !quantity || !acres) {
    setError("All fields are required.");
    return;
  }

  const quantityNum = Number(quantity);
  const acresNum = Number(acres);

  const payload = {
    title: name,
    variety: product_type,
    quantity: quantityNum,
    acres: acresNum,
    description: "",
    price: 0,
  };

  const attemptRequest = async (accessToken: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { res, data };
  };

  let token = localStorage.getItem("access");
  let response = await attemptRequest(token!);

  // If 401, try refreshing
  if (response.res.status === 401) {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      setError("Session expired. Please log in again.");
      return;
    }

    try {
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      const refreshData = await refreshRes.json();
      if (!refreshRes.ok) throw new Error(refreshData.detail || "Failed to refresh token");

      token = refreshData.access;
      if (token) {
        localStorage.setItem("access", token);
      }

      // Retry request with new token
      if (token) {
        response = await attemptRequest(token);
      } else {
        setError("Session expired. Please log in again.");
        return;
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      setError("Session expired. Please log in again.");
      return;
    }
  }

  if (!response.res.ok) {
    console.error("Backend error:", response.data);
    let errorMessage = "Failed to add product. Please check your input.";
    if (response.data) {
      if (response.data.title) errorMessage = response.data.title.join(", ");
      else if (response.data.detail) errorMessage = response.data.detail;
    }
    setError(errorMessage);
    return;
  }

  // Success
  setProducts((prev) => [...prev, response.data]);
  setFormData({ name: "", product_type: "", quantity: "", acres: "" });
  setTermsRead(false);
  setTermsScrolled(false);
  setOpenTerms(false);
};


  const handleSubmitFeedback = async () => {
    if (!newFeedback.trim()) {
      setError("Feedback cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedbacks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({ message: newFeedback }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      setNewFeedback("");
      fetchFeedbacks(accessToken!);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    }
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      setTermsScrolled(true);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34" }}>
              Welcome, {farmerName}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: "#4a6b5e" }}>
              Manage your products, payments, and feedback from the sidebar.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                  <CardContent>
                    <Typography variant="h6" color="#1a3c34">Total Products</Typography>
                    <Typography variant="h4" color="#2f855a">{products.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                  <CardContent>
                    <Typography variant="h6" color="#1a3c34">Pending Payments</Typography>
                    <Typography variant="h4" color="#2f855a">
                      {payments.filter((p) => p.status === "Pending").length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                  <CardContent>
                    <Typography variant="h6" color="#1a3c34">Feedback Received</Typography>
                    <Typography variant="h4" color="#2f855a">{feedbacks.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case "add-product":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34" }}>
              Add New Product, {farmerName}!
            </Typography>
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ style: { color: "#1a3c34" } }}
                InputProps={{ style: { color: "#1a3c34" } }}
              />
              <FormControl fullWidth required>
                <InputLabel sx={{ color: "#1a3c34" }}>Product Type</InputLabel>
                <Select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleInputChange}
                  sx={{ color: "#1a3c34" }}
                >
                  <MenuItem value="Grain">Grain</MenuItem>
                  <MenuItem value="Vegetable">Vegetable</MenuItem>
                  <MenuItem value="Fruit">Fruit</MenuItem>
                  <MenuItem value="Dairy">Dairy</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ style: { color: "#1a3c34" } }}
                InputProps={{ style: { color: "#1a3c34" } }}
              />
              <TextField
                label="Acres"
                name="acres"
                type="number"
                value={formData.acres}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ style: { color: "#1a3c34" } }}
                InputProps={{ style: { color: "#1a3c34" } }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenTerms(true)}
                sx={{ mt: 2 }}
              >
                Submit Product
              </Button>
            </Box>
            <Dialog open={openTerms} onClose={() => setOpenTerms(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Terms and Conditions</DialogTitle>
              <DialogContent onScroll={handleTermsScroll} sx={{ maxHeight: "400px", overflowY: "auto" }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Please read the following terms and conditions carefully before submitting your product:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  1. Product Accuracy: You confirm that all information provided about the product, including name, type, quantity, and acres, is accurate and true to the best of your knowledge.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  2. Compliance: All products must comply with local agricultural regulations and standards. Any misrepresentation may result in the rejection of the product listing.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  3. Quality Assurance: You agree to maintain the quality of the product as described and allow inspections if required by the platform or regulatory authorities.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  4. Liability: The platform is not responsible for any damages or losses incurred due to inaccurate product information or failure to meet delivery commitments.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  5. Data Usage: By submitting this product, you consent to the platform using the provided data for listing, verification, and supply chain tracking purposes.
                </Typography>
                <Typography variant="body2">
                  6. Termination: The platform reserves the right to remove any product listing that violates these terms or platform policies without prior notice.
                </Typography>
              </DialogContent>
              <DialogActions>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsRead}
                      onChange={(e) => setTermsRead(e.target.checked)}
                      disabled={!termsScrolled}
                    />
                  }
                  label="I have read and agree to the terms and conditions"
                />
                <Button onClick={() => setOpenTerms(false)}>Cancel</Button>
                <Button
                  onClick={handleSubmitProduct}
                  color="primary"
                  disabled={!termsRead || !termsScrolled}
                >
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
      case "products":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34" }}>
              My Products, {farmerName}!
            </Typography>
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.pid}>
                  <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}>
                    <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", border: "1px solid #c4d8c9" }}>
                      {product.qr_code && (
                        <CardMedia component="img" height="140" image={product.qr_code} alt="QR Code" sx={{ objectFit: "contain" }} />
                      )}
                      <CardContent>
                        <Typography variant="h6" color="#1a3c34">
                          {product.name} ({product.product_type})
                        </Typography>
                        <Typography variant="body2" color="#4a6b5e">
                          Status: {product.status}
                        </Typography>
                        <Typography variant="body2" color="#4a6b5e">
                          Quantity: {product.quantity}
                        </Typography>
                        <Typography variant="body2" color="#4a6b5e">
                          Acres: {product.acres}
                        </Typography>
                        <Typography variant="body2" color="#4a6b5e">
                          PID: {product.pid}
                        </Typography>
                        <Typography variant="body2" color="#4a6b5e">
                          Harvested: {product.harvested ? "Yes" : "No"}
                        </Typography>
                        <Typography variant="subtitle2" color="#1a3c34" mt={1}>
                          Supply Chain Journey:
                        </Typography>
                        {product.stages.map((stage) => (
                          <Box key={stage.id} sx={{ ml: 2 }}>
                            <Typography variant="body2" color="#4a6b5e">
                              {stage.stage_name} - Qty: {stage.quantity} - Location: {stage.location || "N/A"} - QR Scanned: {stage.scanned_qr ? "Yes" : "No"}
                            </Typography>
                          </Box>
                        ))}
                        <Typography variant="subtitle2" color="#1a3c34" mt={1}>
                          Payments:
                        </Typography>
                        {payments
                          .filter((payment) => payment.product_id === product.id)
                          .map((payment) => (
                            <Box key={payment.id} sx={{ ml: 2 }}>
                              <Typography variant="body2" color="#4a6b5e">
                                Amount: ${payment.amount} - Status: {payment.status} - Date: {new Date(payment.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      case "payments":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34" }}>
              Payments, {farmerName}!
            </Typography>
            {payments.map((payment) => (
              <Card key={payment.id} sx={{ mb: 2, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                <CardContent>
                  <Typography variant="h6" color="#1a3c34">
                    {payment.product_name}
                  </Typography>
                  <Typography variant="body2" color="#4a6b5e">
                    Amount: ${payment.amount}
                  </Typography>
                  <Typography variant="body2" color="#4a6b5e">
                    Status: {payment.status}
                  </Typography>
                  <Typography variant="body2" color="#4a6b5e">
                    Date: {new Date(payment.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        );
      case "feedback":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34" }}>
              Feedback, {farmerName}!
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="#1a3c34" gutterBottom>
                Submit New Feedback
              </Typography>
              <TextField
                label="Your Feedback"
                multiline
                rows={4}
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: "#1a3c34" } }}
                InputProps={{ style: { color: "#1a3c34" } }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitFeedback}
                sx={{ mt: 2 }}
              >
                Submit Feedback
              </Button>
            </Box>
            <Typography variant="h6" color="#1a3c34" gutterBottom>
              Received Feedback
            </Typography>
            {feedbacks.map((fb) => (
              <Card key={fb.id} sx={{ mb: 2, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                <CardContent>
                  <Typography variant="body2" color="#4a6b5e">
                    "{fb.message}" - {new Date(fb.created_at).toLocaleDateString()}
                  </Typography>
                  {fb.product_name && (
                    <Typography variant="body2" color="#4a6b5e">
                      Product: {fb.product_name}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        );
      case "profile":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34" }}>
              Profile, {farmerName}!
            </Typography>
            <Typography variant="body1" sx={{ color: "#4a6b5e" }}>
              Profile management is coming soon. Here you can update your personal information and account settings.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f5f6f5" }}>
        <TopNavBar />
        <Box sx={{ display: "flex", flex: 1 }}>
          {/* Sidebar */}
          <Drawer
            variant="permanent"
            sx={{
              width: 240,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: 240,
                boxSizing: "border-box",
                background: "#ffffff",
                color: "#1a3c34",
                borderRight: "1px solid #c4d8c9",
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Farmer Dashboard
              </Typography>
              <Divider sx={{ borderColor: "#c4d8c9" }} />
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeSection === "dashboard"}
                    onClick={() => setActiveSection("dashboard")}
                  >
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeSection === "add-product"}
                    onClick={() => setActiveSection("add-product")}
                  >
                    <ListItemText primary="Add Product" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeSection === "products"}
                    onClick={() => setActiveSection("products")}
                  >
                    <ListItemText primary="My Products" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeSection === "payments"}
                    onClick={() => setActiveSection("payments")}
                  >
                    <ListItemText primary="Payments" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeSection === "feedback"}
                    onClick={() => setActiveSection("feedback")}
                  >
                    <ListItemText primary="Feedback" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={activeSection === "profile"}
                    onClick={() => setActiveSection("profile")}
                  >
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          </Drawer>

          {/* Main Content */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 2, md: 4 },
              ml: { xs: 0, md: "240px" },
              bgcolor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              m: { xs: 2, md: 4 },
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0.05,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232f855a' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20l10 10-10 10-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {error && (
                <Typography variant="body1" color="error.main" textAlign="center" sx={{ mb: 4 }}>
                  {error}
                </Typography>
              )}
              {renderContent()}
            </motion.div>
          </Box>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}