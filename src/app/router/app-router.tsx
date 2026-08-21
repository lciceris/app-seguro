import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth";
import { AppShell } from "@/app/layout/app-shell";
import { allowedRolesFor } from "@/app/layout/nav-items";
import { AccountDeactivatedPage } from "@/pages/account-deactivated/account-deactivated-page";
import { HomePage } from "@/pages/home/home-page";
import { LoginPage } from "@/pages/login/login-page";
import { SetPasswordPage } from "@/pages/set-password/set-password-page";
import { AddBrokeragePage } from "@/pages/brokerages/add/add-brokerage-page";
import { AddClientPage } from "@/pages/clients/add/add-client-page";
import { ClientDetailPage } from "@/pages/clients/[clientId]/client-detail-page";
import { EditClientPage } from "@/pages/clients/[clientId]/edit/edit-client-page";
import { ClientsPage } from "@/pages/clients/clients-page";
import { BrokeragesPage } from "@/pages/brokerages/brokerages-page";
import { BrokerageDetailPage } from "@/pages/brokerages/[brokerageId]/brokerage-detail-page";
import { EditBrokeragePage } from "@/pages/brokerages/[brokerageId]/edit/edit-brokerage-page";
import { MyBrokeragePage } from "@/pages/my-brokerage/my-brokerage-page";
import { AddInsurerPage } from "@/pages/admin/insurers/add/add-insurer-page";
import { InsurerDetailPage } from "@/pages/admin/insurers/[insurerId]/insurer-detail-page";
import { EditInsurerPage } from "@/pages/admin/insurers/[insurerId]/edit/edit-insurer-page";
import { InsurersPage } from "@/pages/admin/insurers/insurers-page";
import { MyInsurersPage } from "@/pages/my-insurers/my-insurers-page";
import { AddUserPage } from "@/pages/users/add/add-user-page";
import { EditUserPage } from "@/pages/users/[userId]/edit/edit-user-page";
import { UserDetailPage } from "@/pages/users/[userId]/user-detail-page";
import { UsersPage } from "@/pages/users/users-page";
import { AddVehiclePage } from "@/pages/vehicles/add/add-vehicle-page";
import { VehicleDetailPage } from "@/pages/vehicles/[vehicleId]/vehicle-detail-page";
import { EditVehiclePage } from "@/pages/vehicles/[vehicleId]/edit/edit-vehicle-page";
import { VehiclesPage } from "@/pages/vehicles/vehicles-page";
import { QuotationsPage } from "@/pages/quotations/quotations-page";
import { AddQuotationPage } from "@/pages/quotations/add/add-quotation-page";
import { QuotationDetailPage } from "@/pages/quotations/[quotationId]/quotation-detail-page";
import { EditQuotationPage } from "@/pages/quotations/[quotationId]/edit/edit-quotation-page";
import { PoliciesPage } from "@/pages/policies/policies-page";
import { PolicyDetailPage } from "@/pages/policies/[policyId]/policy-detail-page";
import { EditPolicyPage } from "@/pages/policies/[policyId]/edit/edit-policy-page";
import { AddPolicyEndorsementPage } from "@/pages/policies/[policyId]/endorsements/add/add-policy-endorsement-page";
import { PolicyEndorsementDetailPage } from "@/pages/policies/[policyId]/endorsements/[endorsementId]/policy-endorsement-detail-page";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/account-deactivated" element={<AccountDeactivatedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/users")} />}>
            <Route path="/users" element={<UsersPage />}>
              <Route path=":userId" element={<UserDetailPage />} />

              <Route
                element={<ProtectedRoute allowedRoles={["platform_admin", "brokerage_admin"]} />}
              >
                <Route path="add" element={<AddUserPage />} />
                <Route path=":userId/edit" element={<EditUserPage />} />
              </Route>
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/brokerages")} />}>
            <Route path="/brokerages" element={<BrokeragesPage />}>
              <Route path="add" element={<AddBrokeragePage />} />
              <Route path=":brokerageId" element={<BrokerageDetailPage />} />
              <Route path=":brokerageId/edit" element={<EditBrokeragePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/my-brokerage")} />}>
            <Route path="/my-brokerage" element={<MyBrokeragePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/admin/insurers")} />}>
            <Route path="/admin/insurers" element={<InsurersPage />}>
              <Route path="add" element={<AddInsurerPage />} />
              <Route path=":insurerId" element={<InsurerDetailPage />} />
              <Route path=":insurerId/edit" element={<EditInsurerPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/my-insurers")} />}>
            <Route path="/my-insurers" element={<MyInsurersPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/clients")} />}>
            <Route path="/clients" element={<ClientsPage />}>
              <Route path=":clientId" element={<ClientDetailPage />} />

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["platform_admin", "brokerage_admin", "supervisor", "seller"]}
                  />
                }
              >
                <Route path="add" element={<AddClientPage />} />
                <Route path=":clientId/edit" element={<EditClientPage />} />
              </Route>
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/vehicles")} />}>
            <Route path="/vehicles" element={<VehiclesPage />}>
              <Route path="add" element={<AddVehiclePage />} />
              <Route path=":vehicleId" element={<VehicleDetailPage />} />
              <Route path=":vehicleId/edit" element={<EditVehiclePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/quotations")} />}>
            <Route path="/quotations" element={<QuotationsPage />}>
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["platform_admin", "brokerage_admin", "supervisor", "seller"]}
                  />
                }
              >
                <Route path="add" element={<AddQuotationPage />} />
              </Route>
            </Route>

            {/* Página cheia, não drawer — não fica dentro do <Outlet/> de /quotations
                (ver .agents/specs/quotations/design.md, "Divergência de padrão"). */}
            <Route path="/quotations/:quotationId" element={<QuotationDetailPage />}>
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "platform_admin",
                      "brokerage_admin",
                      "supervisor",
                      "analyst",
                      "seller",
                    ]}
                  />
                }
              >
                <Route path="edit" element={<EditQuotationPage />} />
              </Route>
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={allowedRolesFor("/policies")} />}>
            <Route path="/policies" element={<PoliciesPage />}>
              <Route path=":policyId" element={<PolicyDetailPage />} />
              <Route
                path=":policyId/endorsements/:endorsementId"
                element={<PolicyEndorsementDetailPage />}
              />

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["platform_admin", "brokerage_admin", "supervisor"]}
                  />
                }
              >
                <Route path=":policyId/edit" element={<EditPolicyPage />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["platform_admin", "brokerage_admin", "supervisor", "seller"]}
                  />
                }
              >
                <Route path=":policyId/endorsements/add" element={<AddPolicyEndorsementPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
