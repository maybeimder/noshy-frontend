import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { routes } from "./routes";

export default function App() {
      return (
            <BrowserRouter>
                  <Suspense fallback={null}>
                        <Routes>
                              {routes.map(
                                    ({ path, element, public: isPublic }) => (
                                          <Route
                                                key={path}
                                                path={path}
                                                element={ isPublic ? (element) : (element) }
                                          />
                                    ),
                              )}
                              <Route
                                    path="/"
                                    element={<Navigate to="/exams" replace />}
                              />
                        </Routes>
                  </Suspense>
            </BrowserRouter>
      );
}
