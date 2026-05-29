"use client";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useUser } from "../../context/authContext";
import Dashboard from "./dashboard/dashboard";
import Sidebar from "../../components/sidebar/sidebar";
import { AddCircle, Bell } from "@solar-icons/react";
import { Formik } from "formik";
import Button from "../../components/button/button";
import LogoIcon from "../../assets/icons/logo";
import Tasks from "./tasks/page";
import Organizations from "./organizations";
import SearchBar from "../../components/search/searchBar";
import CreateTask from "./create-task/createTask";
import SettingsPage from "./settings";
import Pricing from "./pricing";
import Notifications from "./notifications";
import GetAvatar from "../../customHooks/useGetAvatar";
import { resolveAccountLandingPath } from "../../helpers/appPreferences";
import MobileNav from "../../components/mobileNav/mobileNav";
import IntegrationsPage from "./integrations";
import IntegrationSuccessPage from "./integrations/success";

function AccountPages() {
    const { user } = useUser();

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

  return (
    <div className="flex justify-between bg-bg-gray-100 dark:bg-dark/[0.4]">
        <Sidebar />
        <div className="flex flex-col flex-1 gap-4  md:mt-4 md:mr-4 ml-0">
            <div className="flex p-4 sm:pr-4 pr-18 md:rounded-[10px] items-center justify-between bg-white dark:bg-dark-bg border border-gray-500/[0.1] md:static sticky top-0 z-[3]">
                <Formik
                    initialValues={{ search: "" }}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log(values)
                        setSubmitting(false);
                    }}
                >
                    {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="bg-bg-gray-100 dark:bg-dark-bg rounded-[10px] md:block hidden">
                        <SearchBar />
                    </form>
                    )
                }
                </Formik>
                <Link to="/">
                    <LogoIcon className="md:hidden w-[12px] h-[24px] ml-2"/>
                </Link>

                <div className="flex gap-6 max-[360px]:gap-2 items-center">
                    <Button href="/account/tasks/new" size="small" className="max-[360px]:hidden"><AddCircle /> Voice to tasks</Button>
                    <Button href="/account/tasks/new" size="small" className="max-[300px]:hidden max-[360px]:flex hidden"><AddCircle /> New</Button>
                    <button className="relative p-2">
                        <Bell size={16}/> 
                        <span className="absolute top-1 right-3 p-[2px] w-[2px] h-[2px] rounded-lg bg-red-500"></span>
                    </button>
                    <Link to="/account" className="outline outline-offset-2 outline-primary/[0.2] rounded-full">
                    <GetAvatar email={user?.email || ""} className="w-10 h-10" />
                    </Link>
                </div>
            </div>
            <Routes>
                <Route path="/" element={<Navigate to={resolveAccountLandingPath()} replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/integrations/success" element={<IntegrationSuccessPage />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/tasks/new" element={<CreateTask />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            
            
            <div className=" block md:hidden mt-16">
                <MobileNav />
            </div>
        </div>
    </div>
  )
}

export default AccountPages