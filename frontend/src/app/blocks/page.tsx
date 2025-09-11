"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    const fetchBlocks = async () => {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
      const latest = await provider.getBlockNumber();
      let fetched: any[] = [];

      for (let i = latest; i >= 0 && i > latest - 10; i--) {
        const block = await provider.getBlock(i);
        fetched.push(block);
      }

      setBlocks(fetched);
    };

    fetchBlocks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recent Blocks (Ganache)</h1>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">Block #</th>
              <th className="px-4 py-2 border-b text-left">Hash</th>
              <th className="px-4 py-2 border-b text-left">Tx Count</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((block) => (
              <tr key={block.number} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{block.number}</td>
                <td className="px-4 py-2 border-b text-sm truncate max-w-[300px]">
                  {block.hash}
                </td>
                <td className="px-4 py-2 border-b">{block.transactions.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
