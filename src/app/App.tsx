// App.tsx
import { useRoutes } from "react-router-dom";
import { AuthProvider } from "@/shared/contexts/AuthContext";
import routes from "@/routes/routes";

function App() {
  const element = useRoutes(routes);
  
  return (
    <AuthProvider>
      {element}
    </AuthProvider>
  );
}

export default App;