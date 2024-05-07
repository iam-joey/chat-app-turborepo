import { toast } from "sonner";

function About() {
  return (
    <div className="border-red-950 h-screen flex justify-center items-center bg-slate-500">
      This is about page
      <button onClick={() => toast("My first toast")}>Give me a toast</button>
    </div>
  );
}

export default About;
