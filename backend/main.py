from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

from services.document_service import DocumentService
from services.llm_service import LLMService
from services.workflow_service import WorkflowService
from database import engine, Base

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Workflow Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

doc_service = DocumentService()
llm_service = LLMService()
workflow_service = WorkflowService(doc_service, llm_service)

class WorkflowNode(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Optional[Dict[str, float]] = None

class WorkflowEdge(BaseModel):
    source: str
    target: str
    id: Optional[str] = None

class ExecuteRequest(BaseModel):
    query: str
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]

@app.get("/")
def root():
    return {
        "message": "Workflow Builder API",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        contents = await file.read()
        doc_id = await doc_service.process_document(contents, file.filename)
        return {
            "document_id": doc_id, 
            "filename": file.filename,
            "message": "Document uploaded and processed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/execute")
async def execute_workflow(request: ExecuteRequest):
    try:
        response = await workflow_service.execute(
            request.query, 
            request.nodes, 
            request.edges
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "services": "operational"
    }