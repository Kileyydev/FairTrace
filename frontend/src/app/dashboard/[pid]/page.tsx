"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Stage {
  id: number;
  stage_name: string;
  quantity: number;
  location: string;
  scanned_qr: boolean;
}

export default function ProductTracking() {
  const { pid } = useParams();
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    if (!pid) return;
    const fetchStages = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${pid}/stages/`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("access")}` },
      });
      const data = await res.json();
      setStages(data);
    };
    fetchStages();
  }, [pid]);

  return (
    <div>
      <h2>Product Stages</h2>
      {stages.map(s => (
        <div key={s.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
          <p>Stage: {s.stage_name}</p>
          <p>Quantity: {s.quantity}</p>
          <p>Location: {s.location}</p>
          <p>QR Scanned: {s.scanned_qr ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
}
