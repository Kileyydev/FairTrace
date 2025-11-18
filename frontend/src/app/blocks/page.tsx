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
  Button,
} from "@mui/material";
import { Stamp } from "lucide-react";
import TopNavBar from "@/app/components/TopNavBar";
import Footer from "@/app/components/FooterSection";

interface BlockData {
  number: number;
  hash: string;
  miner: string;
  timestamp: string;
  txCount: number;
}

interface TransactionData {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HardhatExplorer() {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(20); // Start with 20
  const latestBlockRef = useRef<number>(0);
  const totalBlocksRef = useRef<number>(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const loadMoreBlocks = async () => {
    if (isLoadingMore || visibleCount >= totalBlocksRef.current + 1) return;
    
    setIsLoadingMore(true);
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    try {
      const latestBlockNumber = await provider.getBlockNumber();
      const nextCount = Math.min(visibleCount + 20, latestBlockNumber + 1);
      
      const newBlocksToFetch = Array.from(
        { length: nextCount - visibleCount },
        (_, i) => provider.getBlock(latestBlockNumber - visibleCount - i)
      );

      const newBlocks = await Promise.all(newBlocksToFetch);
      
      const formatted = newBlocks
        .filter((b): b is ethers.Block => !!b)
        .map((b) => ({
          number: b.number,
          hash: b.hash ?? "",
          miner: b.miner,
          timestamp: new Date(b.timestamp * 1000).toLocaleString(),
          txCount: b.transactions.length,
        }));

      setBlocks(prev => [...prev, ...formatted]);
      setVisibleCount(nextCount);
    } catch (err) {
      console.error("Failed to load more blocks:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const latestBlockNumber = await provider.getBlockNumber();
        totalBlocksRef.current = latestBlockNumber;

        const count = Math.min(visibleCount, latestBlockNumber + 1);
        const recentBlocks = await Promise.all(
          Array.from({ length: count }, (_, i) =>
            provider.getBlock(latestBlockNumber - i)
          )
        );

        const formattedBlocks: BlockData[] = recentBlocks
          .filter((b): b is ethers.Block => !!b)
          .map((b) => ({
            number: b.number,
            hash: b.hash ?? "",
            miner: b.miner,
            timestamp: new Date(b.timestamp * 1000).toLocaleString(),
            txCount: b.transactions.length,
          }));

        setBlocks(formattedBlocks);
        latestBlockRef.current = latestBlockNumber;

        const fetchedTxs: TransactionData[] = [];
        for (const block of recentBlocks) {
          if (!block) continue;
          for (const txHash of block.transactions) {
            const tx = await provider.getTransaction(txHash as string);
            if (!tx) continue;
            fetchedTxs.push({
              txHash: tx.hash,
              blockNumber: tx.blockNumber!,
              from: tx.from,
              to: tx.to ?? "Contract Creation",
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

    const handleNewBlock = async (blockNumber: number) => {
      if (blockNumber > latestBlockRef.current) {
        await fetchData();
      }
    };

    provider.on("block", handleNewBlock);

    return () => {
      provider.removeListener("block", handleNewBlock);
    };
  }, [visibleCount]);

  const shorten = (addr: string) =>
    addr.length > 12 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr;

  const hasMore = visibleCount < totalBlocksRef.current + 1;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(to bottom, #f8fff8, #e8f5e9)",
      }}
    >
      <TopNavBar />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: { xs: 3, md: 6 } }}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(90deg, #2e7d32, #4caf50)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.5px",
            }}
          >
            FairTrace Blockchain Explorer
          </Typography>
          <Typography variant="subtitle1" color="gray" sx={{ mt: 1 }}>
            Real-time view of your Blockchain network
          </Typography>
        </Box>

        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: "#ffffff",
            border: "1px solid #c8e6c9",
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            centered
            sx={{
              background: "linear-gradient(90deg, #2e7d32, #4caf50)",
              "& .MuiTab-root": {
                color: "#e8f5e9",
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1.1rem",
              },
              "& .Mui-selected": { color: "#ffffff !important" },
              "& .MuiTabs-indicator": { height: 4, backgroundColor: "#c8e6c9" },
            }}
          >
            <Tab label="Latest Blocks" />
            <Tab label="All Transactions" />
          </Tabs>

          {/* Blocks Tab */}
          <TabPanel value={tabIndex} index={0}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={64} thickness={5} sx={{ color: "#4caf50" }} />
              </Box>
            ) : (
              <>
                <TableContainer sx={{ maxHeight: "70vh" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {["Block #", "Hash", "Miner", "Timestamp", "Tx Count"].map((header) => (
                          <TableCell
                            key={header}
                            sx={{
                              backgroundColor: "#2e7d32",
                              color: "#ffffff",
                              fontWeight: "bold",
                              fontSize: "1rem",
                              py: 2,
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {blocks.map((b, idx) => (
                        <TableRow
                          key={b.hash}
                          hover
                          sx={{
                            backgroundColor: idx % 2 === 0 ? "#f1f8e9" : "#e8f5e9",
                            transition: "all 0.2s",
                            "&:hover": {
                              backgroundColor: "#c8e6c9",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 8px rgba(46, 125, 50, 0.15)",
                            },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: "#2e7d32" }}>{b.number}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{shorten(b.hash)}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{shorten(b.miner)}</TableCell>
                          <TableCell>{b.timestamp}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                backgroundColor: "#4caf50",
                                color: "white",
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.5,
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                display: "inline-block",
                              }}
                            >
                              {b.txCount}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* LOAD MORE BUTTON — Certificate Style */}
                {hasMore && (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Button
                      onClick={loadMoreBlocks}
                      disabled={isLoadingMore}
                      sx={{
                        position: "relative",
                        background: "#fff",
                        color: "#1a3c34",
                        border: "4px double #1a3c34",
                        borderRadius: "50%",
                        width: 100,
                        height: 100,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        textTransform: "none",
                        boxShadow: "0 8px 20px rgba(26,60,52,0.25)",
                        transition: "all 0.3s",
                        "&:hover": {
                          background: "#fff",
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 28px rgba(26,60,52,0.35)",
                        },
                        "&:disabled": {
                          opacity: 0.7,
                          cursor: "not-allowed",
                        },
                      }}
                    >
                      {isLoadingMore ? (
                        <CircularProgress size={28} thickness={5} sx={{ color: "#1a3c34" }} />
                      ) : (
                        <>
                          <Stamp size={32} strokeWidth={3} />
                          LOAD MORE
                        </>
                      )}
                    </Button>
                    <Typography
                      sx={{
                        mt: 2,
                        fontWeight: 700,
                        color: "#1a3c34",
                        fontSize: "0.9rem",
                        letterSpacing: "1px",
                      }}
                    >
                      Showing {blocks.length} of {totalBlocksRef.current + 1} blocks
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </TabPanel>

          {/* Transactions Tab — unchanged */}
          <TabPanel value={tabIndex} index={1}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={64} thickness={5} sx={{ color: "#4caf50" }} />
              </Box>
            ) : transactions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" color="gray">No transactions found</Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: "70vh" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {["Tx Hash", "Block #", "From", "To"].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            backgroundColor: "#2e7d32",
                            color: "#ffffff",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            py: 2,
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx, idx) => (
                      <TableRow
                        key={tx.txHash}
                        hover
                        sx={{
                          backgroundColor: idx % 2 === 0 ? "#e8f5e9" : "#c8e6c9",
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: "#a5d6a7",
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 10px rgba(46, 125, 50, 0.2)",
                          },
                        }}
                      >
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{shorten(tx.txHash)}</TableCell>
                        <TableCell sx={{ color: "#2e7d32", fontWeight: 600 }}>{tx.blockNumber}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{shorten(tx.from)}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{shorten(tx.to)}</TableCell>
                      </TableRow>
                    ))}
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