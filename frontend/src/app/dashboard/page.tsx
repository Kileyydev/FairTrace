
"use client";

import React, { useEffect, useState } from "react";
import {
	Box,
	Container,
	Typography,
	Card,
	CardContent,
	CardMedia,
	Grid,
	Button,
	Drawer,
	List,
	ListItem,
	ListItemText,
	Divider,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { motion } from "framer-motion";
import TopNavBar from "../components/TopNavBar";
import Footer from "../components/FooterSection";
import ProductForm from "../components/ProductForm";
import { jwtDecode } from "jwt-decode";

interface Product {
	id: number;
	name: string;
	product_type: string;
	quantity: number;
	status: string;
	pid: string;
	qr_code: string | null;
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
}

interface JwtPayload {
	first_name?: string;
	email: string;
	user_id: number;
	is_sacco_admin: boolean;
}

const theme = createTheme({
	palette: {
		primary: {
			main: "#2f855a",
			contrastText: "#ffffff",
		},
		secondary: {
			main: "#1a3c34",
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	},
});

export default function Dashboard() {
	const [products, setProducts] = useState<Product[]>([]);
	const [farmerName, setFarmerName] = useState<string>("");
	const [openDialog, setOpenDialog] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("access");
			if (!token) {
				window.location.href = "/login";
				return;
			}
			setAccessToken(token);
			try {
				const decoded: JwtPayload = jwtDecode(token);
				console.log("Decoded JWT:", decoded);
				setFarmerName(decoded.first_name || decoded.email || "Farmer");
				fetchProducts(token);
			} catch (err) {
				console.error("JWT decode error:", err);
				setError("Invalid session. Please log in again.");
			}
		}
	}, []);

	const fetchProducts = async (token: string) => {
		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/my-products/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error("Failed to fetch products");
			const data = await res.json();
			console.log("Fetched products:", data);
			setProducts(data || []);
			setError(null);
		} catch (err) {
			console.error("Error fetching products:", err);
			setError("Failed to load products. Please try again.");
		}
	};

	const handleOpenDialog = () => setOpenDialog(true);
	const handleCloseDialog = () => setOpenDialog(false);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					bgcolor: "#1a3c34",
					background: "linear-gradient(135deg, #1a3c34 0%, #2f855a 100%)",
					color: "#ffffff",
				}}
			>
				<TopNavBar />
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						opacity: 0.1,
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4e4d9' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 20l10 10-10 10-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
						backgroundRepeat: "repeat",
					}}
				/>
				<Box sx={{ flex: 1, overflow: "auto", display: "flex" }}>
					<Drawer
						variant="permanent"
						anchor="left"
						sx={{
							width: 220,
							"& .MuiDrawer-paper": {
								width: 220,
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
								<ListItem button component="li" selected>
									<ListItemText primary="My Products" />
								</ListItem>
								<ListItem button component="li" onClick={handleOpenDialog}>
									<ListItemText primary="Add Product" />
								</ListItem>
								<ListItem button component="li">
									<ListItemText primary="Profile" />
								</ListItem>
							</List>
						</Box>
					</Drawer>
					<Box sx={{ flexGrow: 1, p: 4, ml: "220px" }}>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<Typography
								variant="h4"
								fontWeight="600"
								gutterBottom
								sx={{ color: "#ffffff" }}
							>
								Welcome, {farmerName}!
							</Typography>

							{error && (
								<Typography
									variant="body1"
									color="error.main"
									textAlign="center"
									sx={{ mb: 4 }}
								>
									{error}
								</Typography>
							)}

							<Grid container spacing={3}>
								{products.map((product) => (
									<Grid item component="div" xs={12} md={6} key={product.pid}>
										<motion.div
											whileHover={{ scale: 1.03 }}
											transition={{ duration: 0.3 }}
										>
											<Card
												sx={{
													borderRadius: "12px",
													boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
													border: "1px solid #c4d8c9",
													background: "#ffffff",
												}}
											>
												{product.qr_code && (
													<CardMedia
														component="img"
														height="140"
														image={product.qr_code}
														alt="QR Code"
														sx={{ objectFit: "contain" }}
													/>
												)}
												<CardContent>
													<Typography variant="h6" color="#1a3c34">
														{product.name} ({product.product_type})
													</Typography>
													<Typography variant="body2" color="#4a6b5e">
														Quantity: {product.quantity}
													</Typography>
													<Typography variant="body2" color="#4a6b5e">
														Status: {product.status}
													</Typography>
													<Typography variant="body2" color="#4a6b5e">
														PID: {product.pid}
													</Typography>
													<Typography variant="subtitle2" color="#1a3c34" mt={1}>
														Supply Chain Stages:
													</Typography>
													{product.stages.map((stage) => (
														<Box key={stage.id} sx={{ ml: 2 }}>
															<Typography variant="body2" color="#4a6b5e">
																{stage.stage_name} - Qty: {stage.quantity} - Location:{" "}
																{stage.location || "N/A"} - QR Scanned:{" "}
																{stage.scanned_qr ? "Yes" : "No"}
															</Typography>
														</Box>
													))}
													<Typography variant="subtitle2" color="#1a3c34" mt={1}>
														Feedbacks:
													</Typography>
													{product.feedbacks.map((fb) => (
														<Box key={fb.id} sx={{ ml: 2 }}>
															<Typography variant="body2" color="#4a6b5e">
																"{fb.message}" - {new Date(fb.created_at).toLocaleDateString()}
															</Typography>
														</Box>
													))}
												</CardContent>
											</Card>
										</motion.div>
									</Grid>
								))}
							</Grid>

							<ProductForm
								open={openDialog}
								onClose={handleCloseDialog}
								onSuccess={() => {
									if (accessToken) fetchProducts(accessToken);
								}}
							/>
						</motion.div>
					</Box>
				</Box>
				<Footer />
			</Box>
		</ThemeProvider>
	);
}
