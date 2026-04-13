import React from "react";
import Screw from "./Screw";

export default function FrameScrews({ stops }) {
  return (
    <>
      {stops.map((left, index) => (
        <React.Fragment key={`${left}-${index}`}>
          <Screw className="top-[-17px]" style={{ left }} />
          <Screw className="bottom-[-17px]" style={{ left }} />
        </React.Fragment>
      ))}
    </>
  );
}