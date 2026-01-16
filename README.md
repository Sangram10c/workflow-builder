# 🚀 Workflow Builder - No-Code/Low-Code AI Platform

A full-stack application for building intelligent workflows with drag-and-drop components, supporting document processing, LLM integration, and web search capabilities.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Components
- **User Query Component** - Entry point for user input
- **Knowledge Base Component** - Upload PDFs, extract text, create embeddings
- **LLM Engine Component** - AI processing with GPT/Gemini + optional web search
- **Output Component** - Display responses in chat interface

### Workflow Builder
- Drag-and-drop interface with React Flow
- Visual connection lines between components
- Dynamic component configuration panel
- Real-time workflow validation
- Zoom, pan, and minimap controls

### Chat Interface
- Real-time query processing
- Context-aware responses using knowledge base
- Follow-up question support
- Chat history within session

## 🛠️ Tech Stack

### Frontend
- React 18
- React Flow (Drag & Drop)
- Axios (HTTP Client)
- React Toastify (Notifications)
- Tailwind CSS (Styling)

### Backend
- FastAPI (Python Web Framework)
- PostgreSQL (Database)
- ChromaDB (Vector Store)
- OpenAI Embeddings & GPT
- Google Gemini
- SerpAPI (Web Search)
- PyMuPDF (PDF Processing)

## 📁 Project Structure

```
workflow-builder/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── WorkflowCanvas.js      # Main canvas with React Flow
│   │   │   ├── ComponentPanel.js      # Component library panel
│   │   │   ├── ConfigPanel.js         # Configuration panel
│   │   │   ├── ChatModal.js           # Chat interface
│   │   │   └── CustomNode.js          # Custom node design
│   │   ├── App.js                     # Main application
│   │   ├── App.css                    # Styles
│   │   ├── index.js                   # Entry point
│   │   └── index.css                  # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── Dockerfile
├── backend/
│   ├── services/
│   │   ├── __init__.py
│   │   ├── document_service.py        # PDF & embeddings
│   │   ├── llm_service.py             # OpenAI/Gemini integration
│   │   └── workflow_service.py        # Workflow orchestration
│   ├── main.py                        # FastAPI application
│   ├── database.py                    # Database models
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Method 1: Local Development

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on `http://localhost:3000`

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and add your API keys

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs on `http://localhost:8000`

#### Database Setup

```bash
# Install PostgreSQL if not already installed

# Create database
createdb workflow_db

# Tables will be created automatically on first run
```

### Method 2: Docker Deployment

```bash
# Create .env file in root directory with your API keys
cat > .env << EOF
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
SERP_API_KEY=your_serp_key
EOF

# Build and start all services
docker-compose up --build

# To run in detached mode
docker-compose up -d

# To stop services
docker-compose down

# To view logs
docker-compose logs -f
```

Access:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## ⚙️ Configuration

### Frontend Environment Variables
No environment variables required for local development.

### Backend Environment Variables

Create `backend/.env` file:

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
SERP_API_KEY=your-serpapi-key

# Database (default for local development)
DATABASE_URL=postgresql://user:password@localhost:5432/workflow_db

# For Docker
DATABASE_URL=postgresql://user:password@postgres:5432/workflow_db
```

### Getting API Keys

1. **OpenAI API Key**: https://platform.openai.com/api-keys
2. **Gemini API Key**: https://makersuite.google.com/app/apikey
3. **SerpAPI Key**: https://serpapi.com/manage-api-key

## 📖 Usage

### Building a Workflow

1. **Add Components**
   - Drag components from the left panel to the canvas
   - Components available: User Query, Knowledge Base, LLM Engine, Output

2. **Connect Components**
   - Click and drag from the bottom handle of one component to the top handle of another
   - Valid flow: User Query → (Optional) Knowledge Base → LLM Engine → Output

3. **Configure Components**
   - Click on a component to select it
   - Configure in the right panel:
     - **Knowledge Base**: Upload PDF document
     - **LLM Engine**: Select model, add custom prompt, enable web search

4. **Validate Workflow**
   - Click "Build Stack" to validate your workflow
   - Ensure you have User Query, LLM Engine, and Output components

5. **Chat with Stack**
   - Click "Chat with Stack" to open chat interface
   - Ask questions and get AI-powered responses
   - Follow-up questions will use the same workflow

### Example Workflows

#### Simple Q&A
```
User Query → LLM Engine → Output
```

#### Document-Based Q&A
```
User Query → Knowledge Base → LLM Engine → Output
```

#### Web-Enhanced Q&A
```
User Query → LLM Engine (with web search enabled) → Output
```

#### Document + Web Q&A
```
User Query → Knowledge Base → LLM Engine (with web search) → Output
```

## 📡 API Documentation

### Endpoints

#### `GET /`
Health check endpoint
```json
{
  "message": "Workflow Builder API",
  "version": "1.0.0",
  "status": "running"
}
```

#### `POST /api/upload`
Upload and process PDF document

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file)

**Response:**
```json
{
  "document_id": "uuid-string",
  "filename": "document.pdf",
  "message": "Document uploaded and processed successfully"
}
```

#### `POST /api/execute`
Execute workflow with user query

**Request:**
```json
{
  "query": "What is machine learning?",
  "nodes": [...],
  "edges": [...]
}
```

**Response:**
```json
{
  "response": "Machine learning is..."
}
```

#### `GET /api/health`
Service health check
```json
{
  "status": "healthy",
  "database": "connected",
  "services": "operational"
}
```

Interactive API documentation available at: `http://localhost:8000/docs`

## 🐳 Docker Commands

```bash
# Build services
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Remove all containers and volumes
docker-compose down -v
```

## 🔍 Troubleshooting

### Common Issues

#### Frontend Issues

**Issue**: Cannot connect to backend
- **Solution**: Ensure backend is running on port 8000
- Check CORS configuration in `backend/main.py`

**Issue**: Components not draggable
- **Solution**: Clear browser cache and restart
- Check React Flow installation: `npm list reactflow`

#### Backend Issues

**Issue**: Database connection error
- **Solution**: Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Test connection: `psql -U user -d workflow_db`

**Issue**: OpenAI API error
- **Solution**: Verify API key is valid
- Check API quota and billing

**Issue**: ChromaDB error
- **Solution**: ChromaDB runs in-memory by default
- Restart backend service to reset

#### Docker Issues

**Issue**: Port already in use
- **Solution**: Change ports in `docker-compose.yml`
- Or stop conflicting services

**Issue**: Build fails
- **Solution**: Run `docker-compose build --no-cache`
- Check Dockerfile syntax

### Logs

```bash
# Backend logs
tail -f backend.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🎯 Component Details

### User Query Component
- **Purpose**: Entry point for user queries
- **Configuration**: None required
- **Connections**: Output only (source)

### Knowledge Base Component
- **Purpose**: Document processing and semantic search
- **Configuration**: 
  - Upload PDF documents
  - Automatically extracts text
  - Creates embeddings
  - Stores in ChromaDB
- **Connections**: Input and output

### LLM Engine Component
- **Purpose**: AI response generation
- **Configuration**:
  - **Model Selection**: GPT-3.5, GPT-4, Gemini Pro
  - **Custom Prompt**: Optional system instructions
  - **Web Search**: Enable SerpAPI integration
- **Connections**: Input and output

### Output Component
- **Purpose**: Display final response
- **Configuration**: None required
- **Connections**: Input only (target)

## 🔐 Security Notes

- Never commit `.env` files to version control
- Rotate API keys regularly
- Use environment-specific configurations
- Implement rate limiting for production
- Add authentication for production deployments

## 📊 Performance Tips

- Use GPT-3.5 for faster responses
- Limit document size to 10MB
- Enable web search only when needed
- Use connection pooling for database
- Implement caching for frequently asked questions

## 🚀 Future Enhancements

- [ ] Workflow saving/loading
- [ ] Chat history persistence
- [ ] User authentication
- [ ] Execution logs
- [ ] More component types
- [ ] Kubernetes deployment
- [ ] Monitoring with Prometheus/Grafana
- [ ] ELK Stack for logging
- [ ] Multi-user support
- [ ] Workflow templates

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Flow Documentation](https://reactflow.dev/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [ChromaDB Documentation](https://docs.trychroma.com/)

---

**Built with ❤️ for the Full-Stack Engineering Assignment**
