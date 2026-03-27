import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import Landing from "./pages/landing";
import AuthPage from "./pages/auth";
import BookingPage from "./pages/booking";
import PatientPortal from "./pages/patient-portal";
import DoctorWorkspace from "./pages/doctor-workspace";
import AdminPanel from "./pages/admin-panel";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Landing} />
        {/* /login opens the Sign In form */}
        <Route path="/login">{() => <AuthPage initialMode="login" />}</Route>
        {/* /register opens the Create Account form */}
        <Route path="/register">{() => <AuthPage initialMode="register" />}</Route>
        <Route path="/book" component={BookingPage} />
        <Route path="/patient" component={PatientPortal} />
        <Route path="/doctor" component={DoctorWorkspace} />
        <Route path="/admin" component={AdminPanel} />
      </Switch>
      {import.meta.env.DEV && <AgentFeedback />}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
