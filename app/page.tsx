"use client";

import { ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { NodeLibrary } from "@/components/node-library";
import { PreviewPanel } from "@/components/preview-panel";
import { WorkflowToolbar } from "@/components/workflow-toolbar";
import { WorkflowCanvas } from "@/components/workflow-canvas";
import { MessageThreadCollapsible } from "@/source/components/message-thread-collapsible";

export default function Home() {
  return (
    <ReactFlowProvider>
      <div className="h-screen bg-black flex relative">
        <NodeLibrary />
        <WorkflowCanvas />
        <PreviewPanel />
        <WorkflowToolbar />
        <MessageThreadCollapsible />
      </div>
    </ReactFlowProvider>
  );
}
