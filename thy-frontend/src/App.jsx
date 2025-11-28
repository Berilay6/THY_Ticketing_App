// src/App.jsx
import { Routes, Route } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";

import HomePage from "./pages/HomePage";
import MyFlightsPage from "./pages/MyFlightsPage";
import PaymentsHistoryPage from "./pages/PaymentsHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import BookFlightPage from "./pages/BookFlightPage";
import BasketPage from "./pages/BasketPage";
import PaymentPage from "./pages/PaymentPage";
import CheckInPage from "./pages/CheckInPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="my-flights" element={<MyFlightsPage />} />
        <Route path="payments-history" element={<PaymentsHistoryPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="book-flight" element={<BookFlightPage />} />
        <Route path="basket" element={<BasketPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="check-in" element={<CheckInPage />} />
      </Route>
    </Routes>
  );
}
