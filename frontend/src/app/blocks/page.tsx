"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Box,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  CircularProgress,
  Paper,
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import FarmerRegistryABI from "@/app/abis/FarmerRegistry.json";
import ProductRegistryABI from "@/app/abis/ProductRegistry.json";
import deployments from "@/app/deployments.json";

interface TransactionData {
  farmerName?: string;
  productName?: string;
  txHash: string;
}

export default function HardhatExplorer() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const farmerContract = new ethers.Contract(
      deployments.FarmerRegistry,
      FarmerRegistryABI.abi,
      provider
    );
    const productContract = new ethers.Contract(
      deployments.ProductRegistry,
      ProductRegistryABI.abi,
      provider
    );

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const latestBlock = await provider.getBlockNumber();

        const blocks = await Promise.all(
          Array.from({ length: latestBlock + 1 }, (_, i) => provider.getBlock(i))
        );

        const allTxs = await Promise.all(
          blocks.flatMap((block) =>
            block.transactions.map((hash) => provider.getTransaction(hash))
          )
        );

        const fetchedTxs: TransactionData[] = [];

        for (const tx of allTxs) {
          if (!tx.to) continue;

          const toLower = tx.to.toLowerCase();
          let farmerName, productName;

          if (toLower === deployments.FarmerRegistry.toLowerCase()) {
            try {
              const decoded = farmerContract.interface.parseTransaction({
                data: tx.data,
                value: tx.value,
              });
              farmerName = decoded.args.name;
            } catch {}
          } else if (toLower === deployments.ProductRegistry.toLowerCase()) {
            try {
              const decoded = productContract.interface.parseTransaction({
                data: tx.data,
                value: tx.value,
              });
              productName = decoded.args.productName;
            } catch {}
          }

          fetchedTxs.push({
            txHash: tx.hash,
            farmerName,
            productName,
          });
        }

        setTransactions(fetchedTxs.reverse()); // latest first
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNavBar />
      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress color="primary" size={60} />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              flexGrow: 1,
              maxHeight: "70vh",
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tx Hash</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Farmer</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Product</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: "#000", py: 3 }}>
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow
                      key={tx.txHash}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#177f17ff" },
                        "&:nth-of-type(even)": { backgroundColor: "#0d7d07ff" },
                      }}
                    >
                      <TableCell sx={{ fontSize: "0.8rem", color: "#000" }}>{tx.txHash}</TableCell>
                      <TableCell sx={{ color: "#000" }}>{tx.farmerName || "-"}</TableCell>
                      <TableCell sx={{ color: "#000" }}>{tx.productName || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
