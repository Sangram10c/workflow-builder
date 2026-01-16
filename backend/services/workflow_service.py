class WorkflowService:
    def __init__(self, doc_service, llm_service):
        self.doc_service = doc_service
        self.llm_service = llm_service
    
    def build_execution_graph(self, nodes, edges):
        """Build execution graph from nodes and edges"""
        graph = {}
        for edge in edges:
            if edge.source not in graph:
                graph[edge.source] = []
            graph[edge.source].append(edge.target)
        return graph
    
    def find_node_by_type(self, nodes, node_type):
        """Find node by type"""
        for node in nodes:
            if node.type == node_type:
                return node
        return None
    
    def find_nodes_by_type(self, nodes, node_type):
        """Find all nodes of a specific type"""
        return [node for node in nodes if node.type == node_type]
    
    async def execute(self, query, nodes, edges):
        """Execute workflow based on nodes and edges"""
        try:
            # Build execution graph
            graph = self.build_execution_graph(nodes, edges)
            nodes_dict = {node.id: node for node in nodes}
            
            # Find required nodes
            user_query_node = self.find_node_by_type(nodes, 'userQuery')
            llm_node = self.find_node_by_type(nodes, 'llmEngine')
            kb_node = self.find_node_by_type(nodes, 'knowledgeBase')
            output_node = self.find_node_by_type(nodes, 'output')
            
            # Validate workflow
            if not user_query_node or not llm_node or not output_node:
                return "Invalid workflow: Missing required components (User Query, LLM Engine, or Output)"
            
            # Step 1: Process query through knowledge base if available
            context = ""
            if kb_node:
                kb_config = kb_node.data.get('config', {})
                doc_id = kb_config.get('documentId')
                
                if doc_id:
                    context = self.doc_service.retrieve_context(doc_id, query)
            
            # Step 2: Process through LLM
            llm_config = llm_node.data.get('config', {})
            model = llm_config.get('model', 'gpt-3.5-turbo')
            custom_prompt = llm_config.get('prompt', '')
            use_web_search = llm_config.get('useWebSearch', False)
            
            response = await self.llm_service.generate_response(
                query=query,
                context=context,
                model=model,
                custom_prompt=custom_prompt,
                use_web_search=use_web_search
            )
            
            # Step 3: Return response through output node
            return response
            
        except Exception as e:
            return f"Error executing workflow: {str(e)}"