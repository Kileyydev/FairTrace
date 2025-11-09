"use client";

import { useEffect, useState, useRef } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";
import { farmerRegistry, productRegistry } from "@/utils/blockchain";

interface BlockData {
  number: number;
  hash: string;
  miner: string;
  timestamp: string;
  txCount: number;
}

interface TransactionData {
  farmerName?: string;
  productName?: string;
  txHash: string;
  blockNumber: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HardhatExplorer() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const latestBlockRef = useRef<number>(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const latestBlockNumber = await provider.getBlockNumber();

        // Fetch latest 10 blocks
        const recentBlocks = await Promise.all(
          Array.from({ length: Math.min(10, latestBlockNumber + 1) }, (_, i) =>
            provider.getBlock(latestBlockNumber - i)
          )
        );

        // Format blocks
        const formattedBlocks: BlockData[] = recentBlocks
          .filter((b): b is ethers.Block => !!b)
          .map((b) => ({
            number: b.number,
            hash: b.hash ?? "",
            miner: b.miner,
            timestamp: new Date(b.timestamp * 1000).toLocaleTimeString(),
            txCount: b.transactions.length,
          }));

        setBlocks(formattedBlocks);
        latestBlockRef.current = latestBlockNumber;

        // Fetch transactions
        const fetchedTxs: TransactionData[] = [];

        for (const block of recentBlocks) {
          if (!block) continue;
          for (const txHash of block.transactions) {
            const tx = await provider.getTransaction(txHash);
            if (!tx || !tx.to) continue;

            let farmerName: string | undefined;
            let productName: string | undefined;

            try {
              const toLower = tx.to.toLowerCase();

              if (toLower === String(farmerRegistry.target).toLowerCase()) {
                const decoded = farmerRegistry.interface.parseTransaction({
                  data: tx.data,
                  value: tx.value,
                });
                if (decoded?.args?.name) farmerName = decoded.args.name;
              } else if (toLower === String(productRegistry.target).toLowerCase()) {
                const decoded = productRegistry.interface.parseTransaction({
                  data: tx.data,
                  value: tx.value,
                });
                if (decoded?.args?.productName) productName = decoded.args.productName;
              }
            } catch {
              // Ignore errors
            }

            fetchedTxs.push({
              txHash: tx.hash,
              blockNumber: tx.blockNumber!,
              farmerName,
              productName,
            });
          }
        }

        setTransactions(fetchedTxs.reverse());
      } catch (err) {
        console.error("Error fetching blockchain data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Listen for new blocks
    const handleNewBlock = async (blockNumber: number) => {
      if (blockNumber > latestBlockRef.current) {
        await fetchData();
      }
    };

    provider.on("block", handleNewBlock);

    return () => {
      provider.removeListener("block", handleNewBlock);
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f5f5f5" }}>
      <TopNavBar />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, textAlign: "center" }}>
          FairTrace Explorer
        </Typography>

        <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary" centered>
            <Tab label="Blocks" />
            <Tab label="Transactions" />
          </Tabs>

          {/* Blocks Tab */}
          <TabPanel value={tabIndex} index={0}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress color="primary" size={60} />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#2f7038ff" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Block #</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Hash</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Miner</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Timestamp</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tx Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {blocks.map((b) => (
                      <TableRow
                        key={b.hash}
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#f1f8e9" },
                          "&:nth-of-type(even)": { backgroundColor: "#e8f5e9" },
                        }}
                      >
                        <TableCell>{b.number}</TableCell>
                        <TableCell sx={{ fontSize: "0.8rem" }}>{b.hash}</TableCell>
                        <TableCell>{b.miner}</TableCell>
                        <TableCell>{b.timestamp}</TableCell>
                        <TableCell>{b.txCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Transactions Tab */}
          <TabPanel value={tabIndex} index={1}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress color="primary" size={60} />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: "60vh", borderRadius: 2, boxShadow: 3 }}>
                <Table stickyHeader>
                  <TableHead sx={{ backgroundColor: "#2e7d32" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Tx Hash</TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Block #</TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Farmer</TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: "bold" }}>Product</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow
                          key={tx.txHash}
                          sx={{
                            "&:nth-of-type(odd)": { backgroundColor: "#e8f5e9" },
                            "&:nth-of-type(even)": { backgroundColor: "#c8e6c9" },
                          }}
                        >
                          <TableCell sx={{ fontSize: "0.8rem" }}>{tx.txHash}</TableCell>
                          <TableCell>{tx.blockNumber}</TableCell>
                          <TableCell>{tx.farmerName || "-"}</TableCell>
                          <TableCell>{tx.productName || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
