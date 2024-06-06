import { useSocket } from "@/hooks/useSocket";
import { useNavigate } from "react-router-dom";

function CreateRoom() {
  const socket = useSocket();
  const navigate = useNavigate();
  console.log("asdasdsd", socket);
  if (!socket) {
    return (
      <div>
        <h1 className="text-6xl text-red-500">Connecting</h1>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-4xl text-green-500 font-semibold">connected</h1>
      <button
        onClick={() => {
          navigate("/");
        }}
      >
        click me
      </button>
    </div>
  );
}

export default CreateRoom;
