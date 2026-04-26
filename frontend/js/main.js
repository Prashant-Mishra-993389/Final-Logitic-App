// js/main.js — App entry point: wires styles, router, and all pages
import { injectStyles }        from './ui/styles.js';
import { Router }              from './core/router.js';
import { Auth }                from './core/auth.js';
import { AppState }            from './core/state.js';
import { SocketClient }        from './core/socket.js';

// Auth pages
import { loginPage }           from './pages/auth/loginPage.js';
import { registerPage }        from './pages/auth/registerPage.js';
import { otpPage }             from './pages/auth/otpPage.js';
import { forgotPasswordPage }  from './pages/auth/forgotPasswordPage.js';

// Public pages
import { homePage }            from './pages/public/home.js';
import { categoriesPage, categoryDetailsPage } from './pages/public/categories.js';
import { aboutPage, contactPage } from './pages/public/about.js';

// Customer pages
import { customerDashboard }   from './pages/customer/dashboard.js';
import { createOrderPage }     from './pages/customer/createOrder.js';
import { myOrdersPage }        from './pages/customer/myOrders.js';
import { orderDetailsPage }    from './pages/customer/orderDetails.js';
import { quotesPage }          from './pages/customer/quotes.js';
import { paymentPage }         from './pages/customer/payment.js';
import { paymentSuccessPage, paymentFailurePage } from './pages/customer/paymentResult.js';
import { trackingPage }        from './pages/customer/tracking.js';
import { chatPage }            from './pages/customer/chat.js';
import { notificationsPage }   from './pages/customer/notifications.js';
import { profilePage }         from './pages/customer/profile.js';
import { supportPage }         from './pages/customer/support.js';
import { reviewsPage }         from './pages/customer/reviews.js';

// Worker pages
import { workerDashboard }     from './pages/worker/dashboard.js';
import { availableJobsPage }   from './pages/worker/availableJobs.js';
import { assignedJobsPage }    from './pages/worker/assignedJobs.js';
import { createQuotePage }     from './pages/worker/createQuote.js';
import { earningsPage }        from './pages/worker/earnings.js';
import { ratingsPage }         from './pages/worker/ratings.js';
import { availabilityPage }    from './pages/worker/availability.js';
import { documentsPage }       from './pages/worker/documents.js';
import { workerTrackingPage }  from './pages/worker/tracking.js';
import { workerJobDetailsPage } from './pages/worker/jobDetails.js';
import { chatPage as workerChatPage } from './pages/customer/chat.js';

// Admin pages
import { adminDashboard }         from './pages/admin/dashboard.js';
import { adminUsersPage }         from './pages/admin/users.js';
import { adminWorkersPage }       from './pages/admin/workers.js';
import { adminCategoriesPage }    from './pages/admin/categories.js';
import { adminSubcategoriesPage } from './pages/admin/subcategories.js';
import { adminRequirementsPage }  from './pages/admin/requirements.js';
import { adminServicesPage }      from './pages/admin/services.js';
import { adminOrdersPage }        from './pages/admin/orders.js';
import { adminPaymentsPage }      from './pages/admin/payments.js';
import { adminAmcPage }           from './pages/admin/amc.js';
import { adminSupportPage }       from './pages/admin/support.js';
import { auditLogsPage }          from './pages/admin/auditLogs.js';
import { analyticsPage }          from './pages/admin/analytics.js';

// ─────────────────────────────────────────────
// 1. Inject global CSS
// ─────────────────────────────────────────────
injectStyles();

// ─────────────────────────────────────────────
// 2. Register all routes
// ─────────────────────────────────────────────

// Public
Router.register('#/',                  homePage);
Router.register('#/home',              homePage);
Router.register('#/categories',        categoriesPage);
Router.register('#/categories/:id',    categoryDetailsPage);
Router.register('#/about',             aboutPage);
Router.register('#/contact',           contactPage);

// Auth
Router.register('#/login',             loginPage);
Router.register('#/register',          registerPage);
Router.register('#/verify-otp',        otpPage);
Router.register('#/forgot-password',   forgotPasswordPage);

// Customer
Router.register('#/customer/dashboard',     customerDashboard,   { auth: true, role: 'customer' });
Router.register('#/customer/create-order',  createOrderPage,     { auth: true, role: 'customer' });
Router.register('#/customer/orders',        myOrdersPage,        { auth: true, role: 'customer' });
Router.register('#/customer/order/:id',     orderDetailsPage,    { auth: true, role: 'customer' });
Router.register('#/customer/quotes',        quotesPage,          { auth: true, role: 'customer' });
Router.register('#/customer/payment',       paymentPage,         { auth: true, role: 'customer' });
Router.register('#/payment/success',        paymentSuccessPage,  { auth: true });
Router.register('#/payment/failure',        paymentFailurePage,  { auth: true });
Router.register('#/customer/tracking',      trackingPage,        { auth: true, role: 'customer' });
Router.register('#/customer/chat',          chatPage,            { auth: true, role: 'customer' });
Router.register('#/customer/notifications', notificationsPage,   { auth: true, role: 'customer' });
Router.register('#/customer/profile',       profilePage,         { auth: true, role: 'customer' });
Router.register('#/customer/support',       supportPage,         { auth: true, role: 'customer' });
Router.register('#/customer/reviews',       reviewsPage,         { auth: true, role: 'customer' });

// Worker
Router.register('#/worker/dashboard',       workerDashboard,     { auth: true, role: 'worker' });
Router.register('#/worker/available-jobs',  availableJobsPage,   { auth: true, role: 'worker' });
Router.register('#/worker/assigned-jobs',   assignedJobsPage,    { auth: true, role: 'worker' });
Router.register('#/worker/create-quote',    createQuotePage,     { auth: true, role: 'worker' });
Router.register('#/worker/earnings',        earningsPage,        { auth: true, role: 'worker' });
Router.register('#/worker/ratings',         ratingsPage,         { auth: true, role: 'worker' });
Router.register('#/worker/availability',    availabilityPage,    { auth: true, role: 'worker' });
Router.register('#/worker/documents',       documentsPage,       { auth: true, role: 'worker' });
Router.register('#/worker/tracking',        workerTrackingPage,  { auth: true, role: 'worker' });
Router.register('#/worker/job/:id',         workerJobDetailsPage,{ auth: true, role: 'worker' });
Router.register('#/worker/chat',            workerChatPage,      { auth: true, role: 'worker' });
Router.register('#/worker/profile',         profilePage,         { auth: true, role: 'worker' });

// Admin
Router.register('#/admin/dashboard',        adminDashboard,       { auth: true, role: 'admin' });
Router.register('#/admin/users',            adminUsersPage,       { auth: true, role: 'admin' });
Router.register('#/admin/workers',          adminWorkersPage,     { auth: true, role: 'admin' });
Router.register('#/admin/categories',       adminCategoriesPage,  { auth: true, role: 'admin' });
Router.register('#/admin/subcategories',    adminSubcategoriesPage,{ auth: true, role: 'admin' });
Router.register('#/admin/requirements',     adminRequirementsPage, { auth: true, role: 'admin' });
Router.register('#/admin/services',         adminServicesPage,    { auth: true, role: 'admin' });
Router.register('#/admin/orders',           adminOrdersPage,      { auth: true, role: 'admin' });
Router.register('#/admin/payments',         adminPaymentsPage,    { auth: true, role: 'admin' });
Router.register('#/admin/amc',              adminAmcPage,         { auth: true, role: 'admin' });
Router.register('#/admin/support',          adminSupportPage,     { auth: true, role: 'admin' });
Router.register('#/admin/audit-logs',       auditLogsPage,        { auth: true, role: 'admin' });
Router.register('#/admin/analytics',        analyticsPage,        { auth: true, role: 'admin' });

// 404
Router.register('*', homePage);

// ─────────────────────────────────────────────
// 3. Init session → then start router
// ─────────────────────────────────────────────
(async () => {
  // Restore session from stored token/cookie before router starts
  const loggedIn = await Auth.init();

  if (loggedIn) {
    const role = Auth.getRole();

    // Connect socket
    try { SocketClient.connect(); } catch (_) {}

    // Notify badge updates
    SocketClient.on('newNotification', (n) => {
      const cur = AppState.get('unreadNotifications') || 0;
      AppState.set('unreadNotifications', cur + 1);
      import('./components/toast.js').then(({ Toast }) =>
        Toast.info(n.message || 'New notification')
      );
    });

    // ---> FIX: Safely strip query parameters (like ?orderId=123) before checking guest routes
    // This prevents the router from accidentally hiding the dashboard or showing a blank page
    const cleanHash = window.location.hash.split('?')[0];
    
    const guestOnlyRoutes = ['', '#/', '#/home', '#/login', '#/register', '#/verify-otp', '#/forgot-password'];
    if (guestOnlyRoutes.includes(cleanHash) && role) {
      window.location.hash = `#/${role}/dashboard`;
      return; // hashchange will fire → router.start not needed
    }
  }

  // Start the router (fires for current hash)
  Router.start();

  // ---> THE BULLETPROOF REDIRECT FIX <---
  // If the browser does a hard reload (like coming back from Razorpay Netbanking),
  // Single Page App routers sometimes freeze up. This safely forces the router to wake up 
  // and process the page without changing any of your core routing logic.
  window.addEventListener('load', () => {
    window.dispatchEvent(new Event('hashchange'));
  });
})();