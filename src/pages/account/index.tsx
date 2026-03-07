"use client";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useUser } from "../../context/authContext";
import Dashboard from "./dashboard/dashboard";
import Sidebar from "../../components/sidebar/sidebar";
import Input from "../../components/input/input";
import { AddCircle, Bell, Magnifer } from "@solar-icons/react";
import { Formik } from "formik";
import Button from "../../components/button/button";
import LogoIcon from "../../assets/icons/logo";
import Tasks from "./tasks/page";
import Organizations from "./organizations";
import SearchBar from "../../components/search/searchBar";
import CreateTask from "./create-task/createTask";
import SettingsPage from "./settings";

function AccountPages() {
    const { user } = useUser();

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }
  return (
    <div className="min-h-[400px] flex justify-between bg-bg-gray-100 dark:bg-dark/[0.6]">
        <Sidebar />
        <div className="flex flex-col flex-1 gap-4 md:mt-4 md:mr-4 md:ml-0 ml-0">
            <div className="flex p-4 sm:pr-4 pr-18 md:rounded-[10px] items-center justify-between bg-white dark:bg-dark-bg border border-gray-500/[0.1] md:static sticky top-0">
                <Formik
                    initialValues={{ search: "" }}
                    onSubmit={(values, { setSubmitting }) => {
                        console.log(values)
                        setSubmitting(false);
                    }}
                >
                    {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="bg-bg-gray-100 dark:bg-dark-bg-secondary rounded-[10px] md:block hidden">
                        <SearchBar />
                    </form>
                    )
                }
                </Formik>
                <LogoIcon className="md:hidden"/>

                <div className="flex gap-6 items-center">
                    <Button href="/account/tasks/new" size="medium"><AddCircle /> Create</Button>
                    <button className="relative p-2">
                        <Bell size={16}/> 
                        <span className="absolute top-1 right-3 p-[2px] w-[2px] h-[2px] rounded-lg bg-red-500"></span>
                    </button>
                    <Link to="/account" className="outline outline-offset-2 outline-primary/[0.2] rounded-full">
                        <img src="/profile_pic.png" width={26} height={26} alt="avatar" className="rounded-full" />
                    </Link>
                </div>
            </div>
            <Routes>
                <Route path="/" element={<Navigate to={"/account/dashboard"} />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/tasks/new" element={<CreateTask />} />
            </Routes>
        </div>
    </div>
  )
}

export default AccountPages