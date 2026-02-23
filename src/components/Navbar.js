import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center shadow sticky top-0 z-50">

      <div className="flex items-center gap-6">
        <h1
          onClick={() => navigate("/boards")}
          className="text-xl font-bold cursor-pointer"
        >
          Trello
        </h1>

        <span className="text-gray-300 hidden md:block">
          Workspaces
        </span>
      </div>

      <div className="flex items-center gap-4">

        {user && (
          <div className="flex items-center gap-3 bg-slate-700 px-3 py-1 rounded-full">
            <span className="text-sm hidden md:block">
              {user.displayName}
            </span>

            <img
              src={user.photoURL}
              alt="profile"
              className="w-8 h-8 rounded-full border"
            />
          </div>
        )}

        <button
          onClick={logout}
          className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>

      </div>

    </div>
  );
}