import { Route, Routes } from "react-router-dom";
import Topbar from "../../components/topbar/topbar";
import Home from "./home/home";
import Footer from "../../components/footer/footer";
import NotFound from "./not-found";
import FeaturesPage from "./features";
import IntegrationsPage from "./integrations";
import PricingPage from "./pricing";
import HelpCenterPage from "./help-center";
import FaqsPage from "./faqs";
import BlogPage from "./blog";
import AboutUsPage from "./about-us";
import CareersPage from "./careers";
import ForumPage from "./forum";
import AnnouncementsPage from "./announcements";

function StaticPages() {
  return (
    <>
    <Topbar />
    <Routes>
        <Route path="/" element={<Home />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/integrations" element={<IntegrationsPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/help-center" element={<HelpCenterPage />} />
      <Route path="/faqs" element={<FaqsPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/careers" element={<CareersPage />} />
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
    </>
  )
}

export default StaticPages