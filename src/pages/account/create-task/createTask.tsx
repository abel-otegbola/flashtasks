import Button from "../../../components/button/button";
import { useState } from "react";
import { useUser } from "../../../context/authContext";
import CreateTaskModal from "../../../components/modals/createTaskModal";
import CreateTask from "../../../components/createtask/createTask";

function CreateTaskPage() {
  const { user } = useUser();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-dark-bg md:rounded-[10px] xl:px-[16.66%] py-[10%] px-6 h-full mb-4">
      <h1 className="font-medium md:text-[40px] text-[20px] bg-gradient-to-r bg-clip-text text-transparent from-black dark:from-white to-primary leading-[120%]">
        Hi there, {user?.name}
        <br />
        What do you want to do today?
      </h1>

      <p className="text-gray-400">
        Continue from where you stopped yesterday and add today's tasks
      </p>
       <Button
            onClick={() => setShowModal(true)}
            className="text-dark"
            size="small"
            variant="secondary"
        > 
            + Add New Task Manually
        </Button>

        <CreateTaskModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
        />

        <p>OR</p>

        <CreateTask />

    </div>
  );
}

export default CreateTaskPage;
