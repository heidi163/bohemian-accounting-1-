/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from 'react-hot-toast';
import { AppLayout } from "./components/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { InvoiceCreatePage } from "./pages/InvoiceCreatePage";
import { JournalPage } from "./pages/JournalPage";
import { JournalCreatePage } from "./pages/JournalCreatePage";
import { ContactsPage } from "./pages/ContactsPage";
import { ContactCreatePage } from "./pages/ContactCreatePage";
import { BanksPage } from "./pages/BanksPage";
import { BankCreatePage } from "./pages/BankCreatePage";
import { SettingsPage } from "./pages/SettingsPage";
import { ChartOfAccountsPage } from "./pages/ChartOfAccountsPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { PurchaseCreatePage } from "./pages/PurchaseCreatePage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { EmployeeCreatePage } from "./pages/EmployeeCreatePage";
import { PayrollPage } from "./pages/PayrollPage";
import { AssetsPage } from "./pages/AssetsPage";
import { AssetCreatePage } from "./pages/AssetCreatePage";
import { TaxesPage } from "./pages/TaxesPage";
import { LoansPage } from "./pages/LoansPage";
import { PartnersPage } from "./pages/PartnersPage";
import { CostCentersPage } from "./pages/CostCentersPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { CashFlowPage } from "./pages/CashFlowPage";
import { ProfitabilityPage } from "./pages/ProfitabilityPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReportBuilderPage } from "./pages/ReportBuilderPage";
import { PeriodClosingPage } from "./pages/PeriodClosingPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { AuditCompliancePage } from "./pages/AuditCompliancePage";
import { FileManagementPage } from "./pages/FileManagementPage";
import { AutomationPage } from "./pages/AutomationPage";
import { MultiCurrencyPage } from "./pages/MultiCurrencyPage";
import { ImportExportPage } from "./pages/ImportExportPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { EmployeeAdvancesPage } from "./pages/EmployeeAdvancesPage";
import { EndOfServicePage } from "./pages/EndOfServicePage";
import { InsurancesPage } from "./pages/InsurancesPage";
import { EmailTemplatesPage } from "./pages/EmailTemplatesPage";
import { ChecksPage } from "./pages/ChecksPage";

export default function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'inherit', fontSize: '14px', borderRadius: '12px' } }} />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes — no layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* App Routes — with sidebar layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/new" element={<InvoiceCreatePage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="purchases/new" element={<PurchaseCreatePage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/new" element={<EmployeeCreatePage />} />
            <Route path="employees/advances" element={<EmployeeAdvancesPage />} />
            <Route path="employees/end-of-service" element={<EndOfServicePage />} />
            <Route path="employees/insurances" element={<InsurancesPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="assets/new" element={<AssetCreatePage />} />
            <Route path="taxes" element={<TaxesPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="partners" element={<PartnersPage />} />
            <Route path="cash-flow" element={<CashFlowPage />} />
            <Route path="profitability" element={<ProfitabilityPage />} />
            <Route path="cost-centers" element={<CostCentersPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="report-builder" element={<ReportBuilderPage />} />
            <Route path="period-closing" element={<PeriodClosingPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="audit-compliance" element={<AuditCompliancePage />} />
            <Route path="file-management" element={<FileManagementPage />} />
            <Route path="automation" element={<AutomationPage />} />
            <Route path="multi-currency" element={<MultiCurrencyPage />} />
            <Route path="import-export" element={<ImportExportPage />} />
            <Route path="email-templates" element={<EmailTemplatesPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="journal/new" element={<JournalCreatePage />} />
            <Route path="accounts" element={<ChartOfAccountsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="contacts/new" element={<ContactCreatePage />} />
            <Route path="banks" element={<BanksPage />} />
            <Route path="banks/new" element={<BankCreatePage />} />
            <Route path="checks" element={<ChecksPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
