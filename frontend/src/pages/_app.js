import "@/styles/globals.css";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import CustomerLayout from "@/components/CustomerLayout";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isCustomerPage =
    router.pathname.startsWith("/customer/") || router.pathname === "/customer";

  const LayoutComponent = isCustomerPage ? CustomerLayout : Layout;

  return (
    <LayoutComponent>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </LayoutComponent>
  );
}
