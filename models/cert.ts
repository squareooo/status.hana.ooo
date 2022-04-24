import { Document, Schema, Model } from "mongoose";

import createConnection from "@/lib/createConnection";

const alice = createConnection("alice");

interface Cert extends Document {
  DOMAIN: string;
  KEY: string;
  CERT: string;
}

const CertSchema = new Schema<Cert>({
  DOMAIN: {
    type: String,
    required: true,
  },
  KEY: {
    type: String,
  },
  CERT: {
    type: String,
  },
});

export default alice.model<Cert>("cert", CertSchema);
