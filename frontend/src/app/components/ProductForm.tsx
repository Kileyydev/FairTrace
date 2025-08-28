
"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	FormHelperText,
} from "@mui/material";
import { motion } from "framer-motion";

interface ProductFormProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

interface FormData {
	name: string;
	product_type: string;
	quantity: string;
	image: File | null;
}

interface Errors {
	name?: string;
	product_type?: string;
	quantity?: string;
	image?: string;
}

export default function ProductForm({ open, onClose, onSuccess }: ProductFormProps) {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		product_type: "",
		quantity: "",
		image: null,
	});
	const [errors, setErrors] = useState<Errors>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, files } = e.target;
		if (name === "image" && files && files[0]) {
			setFormData({ ...formData, image: files[0] });
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	const validateForm = () => {
		const newErrors: Errors = {};
		if (!formData.name) newErrors.name = "Product name is required";
		if (!formData.product_type) newErrors.product_type = "Product type is required";
		if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0)
			newErrors.quantity = "Valid positive quantity is required";
		if (!formData.image) newErrors.image = "Image is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const form = new FormData();
			form.append("name", formData.name);
			form.append("product_type", formData.product_type);
			form.append("quantity", formData.quantity);
			if (formData.image) form.append("image", formData.image);

			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/create/`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("access")}`,
				},
				body: form,
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.detail || "Failed to create product");
			setFormData({ name: "", product_type: "", quantity: "", image: null });
			setErrors({});
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error("Product creation error:", err);
			setErrors({ ...errors, image: err.message });
		}
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<DialogTitle sx={{ color: "#1a3c34", fontWeight: "600" }}>
					Add New Product
				</DialogTitle>
				<DialogContent sx={{ display: "grid", gap: 3, mt: 1 }}>
					<TextField
						label="Product Name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						error={!!errors.name}
						helperText={errors.name}
						fullWidth
					/>
					<TextField
						label="Product Type"
						name="product_type"
						value={formData.product_type}
						onChange={handleChange}
						required
						error={!!errors.product_type}
						helperText={errors.product_type}
						fullWidth
					/>
					<TextField
						label="Quantity"
						name="quantity"
						type="number"
						value={formData.quantity}
						onChange={handleChange}
						required
						error={!!errors.quantity}
						helperText={errors.quantity}
						fullWidth
					/>
					<Button
						variant="contained"
						component="label"
						sx={{
							background: "#2f855a",
							color: "#ffffff",
							"&:hover": {
								background: "#276749",
								boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
							},
						}}
					>
						Upload Image
						<input
							type="file"
							hidden
							name="image"
							accept="image/*"
							onChange={handleChange}
						/>
					</Button>
					{errors.image && (
						<FormHelperText error sx={{ textAlign: "center" }}>
							{errors.image}
						</FormHelperText>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={onClose}
						sx={{ color: "#2f855a", textTransform: "none" }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						variant="contained"
						sx={{
							background: "#2f855a",
							color: "#ffffff",
							"&:hover": {
								background: "#276749",
							},
						}}
					>
						Create
					</Button>
				</DialogActions>
			</motion.div>
		</Dialog>
	);
}
