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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
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

const DRAWER_WIDTH = 260;

export default function Dashboard() {
  const [farmerName, setFarmerName] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.product_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.pid.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

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
      setFilteredProducts(formattedProducts);
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
      const decoded: any = jwtDecode(token);
      if (decoded.exp && Date.now() / 1000 > decoded.exp) {
        return await refreshAccessToken();
      }
      return token;
    } catch {
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
    setProducts((prev) => [...prev, response.data]);
    setFormData({ farmerName: "", phonenumber: "", location: "", name: "", product_type: "", quantity: "", acres: "" });
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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setOpenProductDialog(true);
  };

  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
    setSelectedProduct(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34", mb: 2 }}>
              Welcome, {farmerName}!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: "#4a6b5e" }}>
              Manage your products, payments, and feedback from the sidebar.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Card sx={{ flex: "1 1 280px", minWidth: "280px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography variant="h6" color="#1a3c34" fontWeight="500">Total Products</Typography>
                  <Typography variant="h4" color="#2f855a" fontWeight="700" mt={1}>{products.length}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: "1 1 280px", minWidth: "280px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography variant="h6" color="#1a3c34" fontWeight="500">Pending Payments</Typography>
                  <Typography variant="h4" color="#2f855a" fontWeight="700" mt={1}>
                    {payments.filter((p) => p.status === "Pending").length}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: "1 1 280px", minWidth: "280px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <Typography variant="h6" color="#1a3c34" fontWeight="500">Feedback Received</Typography>
                  <Typography variant="h4" color="#2f855a" fontWeight="700" mt={1}>{feedbacks.length}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      case "add-product":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34", mb: 3 }}>
              Add New Product
            </Typography>
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "600px" }}>
              <TextField
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
              <FormControl fullWidth required variant="outlined">
                <InputLabel>Product Type</InputLabel>
                <Select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleInputChange}
                  label="Product Type"
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
                variant="outlined"
              />
              <TextField
                label="Acres"
                name="acres"
                type="number"
                value={formData.acres}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenTerms(true)}
                sx={{ mt: 2, py: 1.5, fontWeight: "600" }}
              >
                Submit Product
              </Button>
            </Box>
            <Dialog open={openTerms} onClose={() => setOpenTerms(false)} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ fontWeight: "600", color: "#1a3c34" }}>Terms and Conditions</DialogTitle>
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
              <DialogActions sx={{ p: 2 }}>
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
                  variant="contained"
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
              <Typography variant="h4" fontWeight="600" sx={{ color: "#1a3c34" }}>
                My Products
              </Typography>
              <TextField
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ minWidth: "300px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#4a6b5e" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery("")}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3 }}>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.pid}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleProductClick(product)}
                  style={{ cursor: "pointer" }}
                >
                  <Card sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", height: "100%", display: "flex", flexDirection: "column" }}>
                    {product.qr_code && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.qr_code}
                        alt="QR Code"
                        sx={{ objectFit: "contain", bgcolor: "#f9f9f9" }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" color="#1a3c34" fontWeight="600" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="#4a6b5e" sx={{ mb: 0.5 }}>
                        Type: {product.product_type}
                      </Typography>
                      <Typography variant="body2" color="#4a6b5e" sx={{ mb: 0.5 }}>
                        Status: <strong>{product.status}</strong>
                      </Typography>
                      <Typography variant="body2" color="#4a6b5e" sx={{ mb: 0.5 }}>
                        Quantity: {product.quantity}
                      </Typography>
                      <Typography variant="body2" color="#4a6b5e">
                        Acres: {product.acres}
                      </Typography>
                      <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                        <Typography variant="caption" color="#2f855a" fontWeight="600">
                          Click to view details →
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>

            {/* Product Details Dialog */}
            <Dialog open={openProductDialog} onClose={handleCloseProductDialog} maxWidth="md" fullWidth>
              {selectedProduct && (
                <>
                  <DialogTitle sx={{ fontWeight: "600", color: "#1a3c34", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{selectedProduct.name}</span>
                    <IconButton onClick={handleCloseProductDialog}>
                      <CloseIcon />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent dividers>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {selectedProduct.qr_code && (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2, bgcolor: "#f9f9f9", borderRadius: "8px" }}>
                          <img src={selectedProduct.qr_code} alt="QR Code" style={{ maxWidth: "200px", height: "auto" }} />
                        </Box>
                      )}
                      <Box>
                        <Typography variant="h6" color="#1a3c34" fontWeight="600" gutterBottom>
                          Product Information
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <Typography variant="body1"><strong>Product Type:</strong> {selectedProduct.product_type}</Typography>
                          <Typography variant="body1"><strong>Status:</strong> {selectedProduct.status}</Typography>
                          <Typography variant="body1"><strong>Quantity:</strong> {selectedProduct.quantity}</Typography>
                          <Typography variant="body1"><strong>Acres:</strong> {selectedProduct.acres}</Typography>
                          <Typography variant="body1"><strong>PID:</strong> {selectedProduct.pid}</Typography>
                          <Typography variant="body1"><strong>Harvested:</strong> {selectedProduct.harvested ? "Yes" : "No"}</Typography>
                        </Box>
                      </Box>

                      {selectedProduct.stages.length > 0 && (
                        <Box>
                          <Typography variant="h6" color="#1a3c34" fontWeight="600" gutterBottom>
                            Supply Chain Journey
                          </Typography>
                          {selectedProduct.stages.map((stage) => (
                            <Box key={stage.id} sx={{ ml: 2, mb: 1, p: 2, bgcolor: "#f5f7f6", borderRadius: "8px" }}>
                              <Typography variant="body2" color="#1a3c34" fontWeight="600">
                                {stage.stage_name}
                              </Typography>
                              <Typography variant="body2" color="#4a6b5e">
                                Quantity: {stage.quantity} | Location: {stage.location || "N/A"} | QR Scanned: {stage.scanned_qr ? "Yes" : "No"}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {payments.filter((payment) => payment.product_id === selectedProduct.id).length > 0 && (
                        <Box>
                          <Typography variant="h6" color="#1a3c34" fontWeight="600" gutterBottom>
                            Payment History
                          </Typography>
                          {payments
                            .filter((payment) => payment.product_id === selectedProduct.id)
                            .map((payment) => (
                              <Box key={payment.id} sx={{ ml: 2, mb: 1, p: 2, bgcolor: "#f5f7f6", borderRadius: "8px" }}>
                                <Typography variant="body2" color="#1a3c34">
                                  <strong>Amount:</strong> ${payment.amount} | <strong>Status:</strong> {payment.status}
                                </Typography>
                                <Typography variant="body2" color="#4a6b5e">
                                  Date: {new Date(payment.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            ))}
                        </Box>
                      )}
                    </Box>
                  </DialogContent>
                  <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseProductDialog} variant="contained" color="primary">
                      Close
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>
          </Box>
        );
      case "payments":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34", mb: 3 }}>
              Payments
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: "800px" }}>
              {payments.map((payment) => (
                <Card key={payment.id} sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                  <CardContent>
                    <Typography variant="h6" color="#1a3c34" fontWeight="600" gutterBottom>
                      {payment.product_name}
                    </Typography>
                    <Typography variant="body2" color="#4a6b5e" sx={{ mb: 0.5 }}>
                      Amount: <strong>${payment.amount}</strong>
                    </Typography>
                    <Typography variant="body2" color="#4a6b5e" sx={{ mb: 0.5 }}>
                      Status: <strong>{payment.status}</strong>
                    </Typography>
                    <Typography variant="body2" color="#4a6b5e">
                      Date: {new Date(payment.date).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );
      case "feedback":
        return (
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom sx={{ color: "#1a3c34", mb: 3 }}>
              Feedback
            </Typography>
            <Box sx={{ mb: 4, maxWidth: "700px" }}>
              <Typography variant="h6" color="#1a3c34" gutterBottom fontWeight="500">
                Submit New Feedback
              </Typography>
              <TextField
                label="Your Feedback"
                multiline
                rows={4}
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitFeedback}
                sx={{ py: 1.5, fontWeight: "600" }}
              >
                Submit Feedback
              </Button>
            </Box>
            <Typography variant="h6" color="#1a3c34" gutterBottom fontWeight="500" mb={2}>
              Received Feedback
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: "800px" }}>
              {feedbacks.map((fb) => (
                <Card key={fb.id} sx={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                  <CardContent>
                    <Typography variant="body1" color="#1a3c34" sx={{ mb: 1 }}>
                      "{fb.message}"
                    </Typography>
                    <Typography variant="body2" color="#4a6b5e">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </Typography>
                    {fb.product_name && (
                      <Typography variant="body2" color="#4a6b5e" mt={1}>
                        Product: <strong>{fb.product_name}</strong>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "#f5f7f6" }}>
        <TopNavBar />
        <Box sx={{ display: "flex", flex: 1, position: "relative" }}>
          {/* Sidebar - Fixed height between TopNavBar and Footer */}
          <Box
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "fixed",
                width: DRAWER_WIDTH,
                top: "64px",
                bottom: "130px",
             
                background: "#ffffff",
                borderRight: "1px solid #e0e0e0",
                zIndex: 10,
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight="600" mb={2} color="#1a3c34">
                  Farmer Dashboard
                </Typography>
                <Divider sx={{ borderColor: "#e0e0e0", mb: 2 }} />
                <List>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={activeSection === "dashboard"}
                      onClick={() => setActiveSection("dashboard")}
                      sx={{
                        borderRadius: "8px",
                        "&.Mui-selected": {
                          bgcolor: "#e8f5e9",
                          "&:hover": { bgcolor: "#e8f5e9" },
                        },
                      }}
                    >
                      <ListItemText primary="Dashboard" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={activeSection === "add-product"}
                      onClick={() => setActiveSection("add-product")}
                      sx={{
                        borderRadius: "8px",
                        "&.Mui-selected": {
                          bgcolor: "#e8f5e9",
                          "&:hover": { bgcolor: "#e8f5e9" },
                        },
                      }}
                    >
                      <ListItemText primary="Add Product" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={activeSection === "products"}
                      onClick={() => setActiveSection("products")}
                      sx={{
                        borderRadius: "8px",
                        "&.Mui-selected": {
                          bgcolor: "#e8f5e9",
                          "&:hover": { bgcolor: "#e8f5e9" },
                        },
                      }}
                    >
                      <ListItemText primary="My Products" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={activeSection === "payments"}
                      onClick={() => setActiveSection("payments")}
                      sx={{
                        borderRadius: "8px",
                        "&.Mui-selected": {
                          bgcolor: "#e8f5e9",
                          "&:hover": { bgcolor: "#e8f5e9" },
                        },
                      }}
                    >
                      <ListItemText primary="Payments" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={activeSection === "feedback"}
                      onClick={() => setActiveSection("feedback")}
                      sx={{
                        borderRadius: "8px",
                        "&.Mui-selected": {
                          bgcolor: "#e8f5e9",
                          "&:hover": { bgcolor: "#e8f5e9" },
                        },
                      }}
                    >
                      <ListItemText primary="Feedback" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3, md: 4 },
              minHeight: "calc(100vh - 124px)",
              bgcolor: "#ffffff",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {error && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: "#ffebee",
                    borderRadius: "8px",
                    border: "1px solid #ef5350",
                  }}
                >
                  <Typography variant="body1" color="error.main">
                    {error}
                  </Typography>
                </Box>
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