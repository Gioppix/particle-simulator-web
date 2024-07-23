import { useState } from "react";
import Graphics from "./graphics";

function App() {
  const [forceMul, setForceMul] = useState(1);

  return (
    <div className="h-[100dvh] w-[100dvw] flex flex-col">
      <div className="">
        <input
          type="range"
          min={-3}
          max={3}
          step={0.01}
          value={forceMul}
          onChange={(e) => setForceMul(Number(e.target.value))}
        />
      </div>
      <div className="flex-grow">
        <Graphics forceMul={forceMul} />
      </div>
    </div>
  );
}

export default App;
