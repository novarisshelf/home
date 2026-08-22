// i18n.js
// Tiny, dependency-free site-wide language switcher (বাংলা / English).
//
// How it works:
// - Static text: give an element `data-i18n="key"` (textContent),
//   `data-i18n-placeholder="key"` (input placeholder), or
//   `data-i18n-aria="key"` (aria-label). This file auto-runs on
//   DOMContentLoaded and fills them all in — no per-page wiring needed
//   beyond `<script type="module" src="i18n.js"></script>`.
// - Dynamic text (built in JS, e.g. book cards, cart rows, toasts): import
//   `t` from this file and call `t('key')` wherever a UI string is built.
// - The language choice is stored in localStorage and applied on every
//   page load. Changing it (via setLang) reloads the page so both static
//   and dynamic content re-render correctly in the new language.
//
// Scope: this only translates the app's own interface text (labels,
// buttons, headings, messages). Content typed into the admin panel (book
// titles, authors, descriptions, genre/category names) is real data, not
// app text, so it is shown as entered either way.

const STORAGE_KEY = 'novaris_lang';

const dict = {
  bn: {
    // Navbar / owner bar
    nav_home_decor: 'Home Decor',
    nav_login: 'লগইন',
    nav_dashboard: 'ড্যাশবোর্ড',
    nav_cart: 'কার্ট',
    owner_orders: 'অর্ডার',
    owner_manage_books: 'বই পরিচালনা',
    owner_manage_decor: 'ডেকর পরিচালনা',
    owner_logout: 'লগআউট',

    // Common
    back_home: 'হোমে ফিরুন',
    loading: 'লোড হচ্ছে…',
    see_all: 'সব দেখুন',
    out_of_stock: 'স্টক নেই',
    add_to_cart: 'কার্টে যোগ করুন',
    added_to_cart: 'কার্টে যোগ করা হয়েছে ✓',
    not_in_stock: 'স্টকে নেই',
    empty_no_results: 'কিছু পাওয়া যায়নি। অন্য নাম দিয়ে খুঁজে দেখুন।',
    empty_category: 'এই ক্যাটাগরিতে কিছু পাওয়া যায়নি।',
    error_generic: 'তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।',
    search_placeholder: 'বই বা জিনিস খুঁজুন…',
    search_results_for: '"{q}" এর জন্য ফলাফল ({n})',

    // index.html
    site_tagline: 'বাংলা বই ও ঘর সাজানোর জিনিসপত্রের অনলাইন দোকান',

    // book.html / decor-item.html detail
    pages_suffix: 'পৃষ্ঠা',
    publisher_label: 'প্রকাশনী',
    edition_label: 'সংস্করণ',
    binding_label: 'বাঁধাই',
    paper_label: 'কাগজ',
    material_label: 'উপাদান',
    dimensions_label: 'মাপ',
    category_label: 'ক্যাটাগরি',
    description_label: 'বিবরণ',
    book_not_found: 'দুঃখিত, বইটি খুঁজে পাওয়া যায়নি।',
    book_loading: 'বইটি খোঁজা হচ্ছে…',
    item_not_found: 'দুঃখিত, জিনিসটি খুঁজে পাওয়া যায়নি।',
    item_loading: 'জিনিসটি খোঁজা হচ্ছে…',

    // cart.html
    cart_title: 'আপনার কার্ট',
    cart_empty: 'আপনার কার্ট খালি।',
    cart_browse: 'কেনাকাটা শুরু করুন',
    cart_browse_start: 'কেনাকাটা করুন',
    cart_items_heading: 'পণ্যসমূহ ({n})',
    cart_subtotal: 'সাবটোটাল',
    cart_total: 'মোট',
    cart_checkout: 'চেকআউট',
    cart_remove: 'সরিয়ে ফেলুন',
    cart_qty_decrease: 'কমান',
    cart_qty_increase: 'বাড়ান',

    // checkout
    checkout_title: 'ডেলিভারি তথ্য',
    checkout_name: 'নাম *',
    checkout_phone: 'ফোন নম্বর *',
    checkout_phone_error: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন',
    checkout_address: 'ঠিকানা *',
    checkout_email: 'ইমেইল (ঐচ্ছিক)',
    checkout_delivery_location: 'ডেলিভারি এলাকা *',
    checkout_delivery_inside: 'ঢাকার ভেতরে (ফ্রি)',
    checkout_delivery_outside: 'ঢাকার বাইরে (+৳১২০)',
    cart_delivery_charge: 'ডেলিভারি চার্জ',
    order_delivery_inside: 'ডেলিভারি: ঢাকার ভেতরে (ফ্রি)',
    order_delivery_outside: 'ডেলিভারি: ঢাকার বাইরে (+৳১২০)',
    checkout_place_order: 'অর্ডার করুন',
    checkout_sending: 'পাঠানো হচ্ছে…',
    checkout_error: 'অর্ডার পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    checkout_success_title: 'অর্ডার সম্পন্ন হয়েছে!',
    checkout_success_msg: 'আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই যোগাযোগ করা হবে।',
    checkout_success_msg2: 'ধন্যবাদ! আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে।',

    // account.html
    account_owner_login_title: 'মালিক লগইন',
    account_owner_login_sub: 'অর্ডার ও বই পরিচালনা করতে লগইন করুন',
    account_login_title: 'লগইন',
    account_signup_tab: 'সাইন আপ',
    account_signup_title: 'অ্যাকাউন্ট তৈরি করুন',
    account_email: 'ইমেইল',
    account_password: 'পাসওয়ার্ড',
    account_password_placeholder: 'আপনার পাসওয়ার্ড',
    account_name: 'নাম',
    account_your_name: 'আপনার নাম',
    account_login_btn: 'লগইন করুন',
    account_signup_btn: 'অ্যাকাউন্ট তৈরি করুন',
    account_or: 'অথবা',
    account_google: 'Google দিয়ে চালিয়ে যান',
    account_no_account: 'অ্যাকাউন্ট নেই?',
    account_have_account: 'অ্যাকাউন্ট আছে?',
    account_forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
    account_back_to_login: 'লগইনে ফিরুন',
    account_forgot_intro: 'আপনার ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট করার লিংক পাঠিয়ে দেব।',
    account_forgot_google_note: 'Google দিয়ে সাইন আপ করেছেন? তাহলে <strong>Google দিয়ে চালিয়ে যান</strong> বাটন দিয়ে লগইন করুন — এখানে কোনো পাসওয়ার্ড রিসেট করার দরকার নেই।',
    account_send_reset: 'রিসেট লিংক পাঠান',
    account_check_inbox: 'আপনার ইনবক্স চেক করুন!',
    account_verify_sub_rest: 'ঠিকানায় একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। অ্যাকাউন্ট চালু করতে লিংকে ক্লিক করুন (স্প্যাম ফোল্ডারও দেখুন)। এরপর লগইন ট্যাব থেকে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।',
    account_resend: 'আবার পাঠান',
    account_go_to_login: 'লগইনে যান',
    checkout_name_plain: 'পূর্ণ নাম',
    checkout_phone_plain: 'ফোন নম্বর',
    account_optional: '(ঐচ্ছিক)',
    account_min_chars: 'ন্যূনতম ৮ ক্যারেক্টার',
    account_confirm_password: 'পাসওয়ার্ড আবার লিখুন',
    account_default_name: 'কাস্টমার',
    account_load_error: 'প্রোফাইল লোড করা যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।',

    // my-orders.html
    orders_title: 'আমার অর্ডার',
    orders_loading: 'অর্ডার লোড হচ্ছে…',
    orders_empty: 'আপনার এখনো কোনো অর্ডার নেই।',
    orders_status: 'অবস্থা',
    orders_total: 'মোট',
    orders_date: 'তারিখ',
    order_status_pending: 'পেন্ডিং',
    order_status_confirmed: 'কনফার্ম',
    order_status_on_the_way: 'পথে আছে',
    order_status_delivered: 'ডেলিভার্ড',
    order_status_cancelled: 'বাতিল',
    owner_filter_all: 'সব',
    owner_action_confirm: 'কনফার্ম করুন',
    owner_action_cancel: 'বাতিল করুন',
    owner_action_on_the_way: 'পথে আছে',
    owner_action_delivered: 'ডেলিভার্ড হয়েছে',
    owner_tracking_placeholder: 'ট্র্যাকিং লিংক',
    owner_save_tracking: 'সংরক্ষণ',
    owner_saved: 'সংরক্ষিত ✓',
    owner_confirm_cancel: 'এই অর্ডারটি বাতিল করতে চান?',
    owner_update_error: 'আপডেট করা যায়নি। আবার চেষ্টা করুন।',
    order_tracking_label: 'ট্র্যাকিং লিংক দেখুন',
    order_step_placed: 'অর্ডার হয়েছে',
    order_step_confirmed: 'কনফার্ম',
    order_step_on_the_way: 'পথে আছে',
    order_step_delivered: 'ডেলিভার্ড',
    order_cancelled_note: 'এই অর্ডারটি বাতিল করা হয়েছে',

    // my-account.html
    account_dashboard_member_since: 'যোগ দিয়েছেন',
    account_dashboard_last_signin: 'সর্বশেষ লগইন',
    account_dashboard_logout: 'লগআউট',
    account_dashboard_quick_access: 'দ্রুত অ্যাক্সেস',
    account_dashboard_orders: 'আমার অর্ডার',
    account_dashboard_orders_desc: 'অর্ডার হিস্ট্রি দেখুন',
    account_dashboard_cart: 'কার্ট',
    account_dashboard_cart_desc: 'আপনার কার্ট দেখুন',
    account_dashboard_books: 'বই দেখুন',
    account_dashboard_books_desc: 'সব বই ব্রাউজ করুন',
    account_dashboard_decor_desc: 'ঘর সাজানোর জিনিস দেখুন',
    settings_menu_label: 'সেটিংস',
    settings_language: 'ভাষা',
    settings_theme: 'থিম',
    settings_dark_theme: 'ডার্ক থিম',
    settings_lang_bn: 'বাংলা',
    settings_lang_en: 'English',
    footer_rights: 'সর্বস্বত্ব সংরক্ষিত',

    // Book Request section (homepage)
    book_request_title: 'বই রিকোয়েস্ট করুন',
    book_request_sub: 'আপনার পছন্দের বইটি খুঁজে পাচ্ছেন না? নিচের ফর্মটি পূরণ করুন — আমরা বইটি সংগ্রহ করে আপনার ঠিকানায় পৌঁছে দেব।',
    book_request_home_teaser: 'আপনার পছন্দের বইটি খুঁজে পাচ্ছেন না? আমাদের বই রিকোয়েস্ট পেজে গিয়ে জানিয়ে দিন — আমরা বইটি সংগ্রহ করে আপনার ঠিকানায় পৌঁছে দেব।',
    book_request_cta_link: 'রিকোয়েস্ট পেজে যান',
    book_request_name_label: 'আপনার নাম',
    book_request_name_placeholder: 'আপনার পুরো নাম',
    book_request_phone_label: 'যোগাযোগের নম্বর',
    book_request_phone_placeholder: '+৮৮০ ১XXX-XXXXXX',
    book_request_book_label: 'বইয়ের নাম',
    book_request_book_placeholder: 'যেমন: শেষের কবিতা',
    book_request_author_label: 'লেখকের নাম',
    book_request_author_placeholder: 'যেমন: রবীন্দ্রনাথ ঠাকুর',
    book_request_edition_label: 'সংস্করণ',
    book_request_edition_placeholder: 'যেমন: ১ম সংস্করণ / ভারতীয় সংস্করণ',
    book_request_address_label: 'ডেলিভারি ঠিকানা',
    book_request_address_placeholder: 'সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড/এলাকা/শহর)',
    book_request_note_label: 'অতিরিক্ত তথ্য (ঐচ্ছিক)',
    book_request_note_placeholder: 'বইটি সংগ্রহ করতে সাহায্য হবে এমন কোনো তথ্য থাকলে লিখুন — প্রকাশনী, কভার, কোথায় পাওয়া যায় ইত্যাদি',
    book_request_submit: 'রিকোয়েস্ট পাঠান',
    book_request_sending: 'পাঠানো হচ্ছে…',
    book_request_error: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন, অথবা সরাসরি ফোন করুন।',
    book_request_success_title: 'ধন্যবাদ! 🎉',
    book_request_success_msg: 'আপনার রিকোয়েস্ট আমরা পেয়েছি। শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।',
    book_request_close: 'ঠিক আছে',
    book_request_history_btn: 'হিস্ট্রি',
    book_request_new_request: 'নতুন রিকোয়েস্ট',
    book_request_login_note: 'ভবিষ্যতের জন্য তথ্য সংরক্ষণ করতে ও আপনার রিকোয়েস্ট হিস্ট্রি দেখতে <a href="account.html">লগইন করুন</a>।',
    book_request_history_title: 'আপনার রিকোয়েস্ট হিস্ট্রি',
    book_request_history_empty: 'আপনি এখনো কোনো বই রিকোয়েস্ট করেননি।',
    book_request_step1_title: 'ফর্ম পূরণ করুন',
    book_request_step1_desc: 'বইয়ের নাম, লেখক ও ঠিকানা লিখে পাঠিয়ে দিন — এক মিনিটেই শেষ।',
    book_request_step2_title: 'আমরা খুঁজে বের করি',
    book_request_step2_desc: 'সাধারণত ১–২ কর্মদিবসের মধ্যে আমরা ফোনে যোগাযোগ করে দাম ও প্রাপ্তিসাপেক্ষে জানাই।',
    book_request_step3_title: 'ঠিকানায় পৌঁছে যায়',
    book_request_step3_desc: 'নিশ্চিত হলে বইটি সংগ্রহ করে সরাসরি আপনার ঠিকানায় ডেলিভারি দেওয়া হয়।',

    // dashboard.html (owner orders)
    owner_orders_title: 'অর্ডার ইতিহাস',
    owner_orders_empty: 'এখনো কোনো অর্ডার আসেনি।',
    owner_orders_error: 'অর্ডার লোড করা যায়নি। Firebase কনফিগারেশন যাচাই করুন।',
    login_signing_in: 'লগইন হচ্ছে…',
    login_invalid: 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।',

    // admin.html / admin-decor.html
    admin_books_title: 'বই পরিচালনা',
    admin_add_new: 'নতুন যোগ করুন',
    admin_add_new_book: 'নতুন বই যোগ করুন',
    admin_edit_book: 'বই সম্পাদনা করুন',
    admin_update_btn: 'আপডেট করুন',
    admin_add_book_btn: 'যোগ করুন',
    admin_current_books: 'বর্তমান বইসমূহ',
    admin_no_books_yet: 'এখনো কোনো বই যোগ করা হয়নি।',
    admin_confirm_delete_book: 'এই বইটি মুছে ফেলতে চান?',
    admin_books_load_error: 'বই লোড করা যায়নি। Firebase কনফিগারেশন যাচাই করুন।',
    admin_pages_label: 'পৃষ্ঠা *',
    admin_select: '— নির্বাচন করুন —',
    admin_decor_title: 'ডেকর পরিচালনা',
    admin_add_new_item: 'নতুন পণ্য যোগ করুন',
    admin_edit_item: 'পণ্য সম্পাদনা করুন',
    admin_current_items: 'বর্তমান পণ্যসমূহ',
    admin_no_items_yet: 'এখনো কোনো পণ্য যোগ করা হয়নি।',
    admin_confirm_delete_item: 'এই পণ্যটি মুছে ফেলতে চান?',
    admin_items_load_error: 'পণ্য লোড করা যায়নি। Firebase কনফিগারেশন যাচাই করুন।',
    admin_name_label: 'নাম *',
    category_label_req: 'ক্যাটাগরি *',
    admin_image_url: 'ছবির URL *',
    admin_save: 'সংরক্ষণ করুন',
    admin_cancel: 'বাতিল',
    admin_edit: 'সম্পাদনা',
    admin_delete: 'মুছুন',
    admin_title_label: 'শিরোনাম',
    admin_author_label: 'লেখক',
    admin_genre_label: 'জনরা',
    admin_current_price: 'বর্তমান মূল্য',
    admin_regular_price: 'নিয়মিত মূল্য',
    admin_cover_url: 'কভার ছবির URL',
    admin_in_stock: 'স্টকে আছে',
    admin_save_error: 'সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।'
  },

  en: {
    nav_home_decor: 'Home Decor',
    nav_login: 'Login',
    nav_dashboard: 'Dashboard',
    nav_cart: 'Cart',
    owner_orders: 'Orders',
    owner_manage_books: 'Manage Books',
    owner_manage_decor: 'Manage Decor',
    owner_logout: 'Logout',

    back_home: 'Back to home',
    loading: 'Loading…',
    see_all: 'See all',
    out_of_stock: 'Out of stock',
    add_to_cart: 'Add to cart',
    added_to_cart: 'Added to cart ✓',
    not_in_stock: 'Out of stock',
    empty_no_results: 'Nothing found. Try a different name.',
    empty_category: 'Nothing found in this category.',
    error_generic: 'Could not load the list. Please try again.',
    search_placeholder: 'Search books or items…',
    search_results_for: 'Results for "{q}" ({n})',

    site_tagline: 'Online shop for Bangla books and home decor',

    pages_suffix: 'pages',
    publisher_label: 'Publisher',
    edition_label: 'Edition',
    binding_label: 'Binding',
    paper_label: 'Paper',
    material_label: 'Material',
    dimensions_label: 'Dimensions',
    category_label: 'Category',
    description_label: 'Description',
    book_not_found: 'Sorry, this book could not be found.',
    book_loading: 'Looking up the book…',
    item_not_found: 'Sorry, this item could not be found.',
    item_loading: 'Looking up the item…',

    cart_title: 'Your Cart',
    cart_empty: 'Your cart is empty.',
    cart_browse: 'Start shopping',
    cart_browse_start: 'Start shopping',
    cart_items_heading: 'Items ({n})',
    cart_subtotal: 'Subtotal',
    cart_total: 'Total',
    cart_checkout: 'Checkout',
    cart_remove: 'Remove',
    cart_qty_decrease: 'Decrease',
    cart_qty_increase: 'Increase',

    checkout_title: 'Delivery Information',
    checkout_name: 'Name *',
    checkout_phone: 'Phone number *',
    checkout_phone_error: 'Enter a valid Bangladeshi mobile number',
    checkout_address: 'Address *',
    checkout_email: 'Email (optional)',
    checkout_delivery_location: 'Delivery area *',
    checkout_delivery_inside: 'Inside Dhaka (Free)',
    checkout_delivery_outside: 'Outside Dhaka (+৳120)',
    cart_delivery_charge: 'Delivery charge',
    order_delivery_inside: 'Delivery: Inside Dhaka (Free)',
    order_delivery_outside: 'Delivery: Outside Dhaka (+৳120)',
    checkout_place_order: 'Place order',
    checkout_sending: 'Sending…',
    checkout_error: 'Could not place the order. Please try again.',
    checkout_success_title: 'Order placed!',
    checkout_success_msg: 'Your order has been received. We\u2019ll contact you soon.',
    checkout_success_msg2: 'Thank you! Your order was placed successfully.',

    account_owner_login_title: 'Owner Login',
    account_owner_login_sub: 'Log in to manage orders and books',
    account_login_title: 'Log in',
    account_signup_tab: 'Sign up',
    account_signup_title: 'Create account',
    account_email: 'Email',
    account_password: 'Password',
    account_password_placeholder: 'Your password',
    account_name: 'Name',
    account_your_name: 'Your name',
    account_login_btn: 'Log in',
    account_signup_btn: 'Create account',
    account_or: 'or',
    account_google: 'Continue with Google',
    account_no_account: 'No account?',
    account_have_account: 'Already have an account?',
    account_forgot: 'Forgot password?',
    account_back_to_login: 'Back to login',
    account_forgot_intro: 'Enter your email and we\u2019ll send you a password reset link.',
    account_forgot_google_note: 'Signed up with Google? Just log in with the <strong>Continue with Google</strong> button — no password reset needed here.',
    account_send_reset: 'Send reset link',
    account_check_inbox: 'Check your inbox!',
    account_verify_sub_rest: 'has been sent a verification link. Click the link to activate your account (check your spam folder too). Then log in from the Login tab with your email and password.',
    account_resend: 'Resend',
    account_go_to_login: 'Go to login',
    checkout_name_plain: 'Full name',
    checkout_phone_plain: 'Phone number',
    account_optional: '(optional)',
    account_min_chars: 'Minimum 8 characters',
    account_confirm_password: 'Confirm password',
    account_default_name: 'Customer',
    account_load_error: 'Could not load your profile. Please refresh and try again.',

    orders_title: 'My Orders',
    orders_loading: 'Loading orders…',
    orders_empty: 'You don\u2019t have any orders yet.',
    orders_status: 'Status',
    orders_total: 'Total',
    orders_date: 'Date',
    order_status_pending: 'Pending',
    order_status_confirmed: 'Confirmed',
    order_status_on_the_way: 'On the way',
    order_status_delivered: 'Delivered',
    order_status_cancelled: 'Cancelled',
    owner_filter_all: 'All',
    owner_action_confirm: 'Confirm',
    owner_action_cancel: 'Cancel',
    owner_action_on_the_way: 'On the way',
    owner_action_delivered: 'Delivered',
    owner_tracking_placeholder: 'Tracking link',
    owner_save_tracking: 'Save',
    owner_saved: 'Saved ✓',
    owner_confirm_cancel: 'Cancel this order?',
    owner_update_error: 'Could not update. Please try again.',
    order_tracking_label: 'View tracking link',
    order_step_placed: 'Placed',
    order_step_confirmed: 'Confirmed',
    order_step_on_the_way: 'On the way',
    order_step_delivered: 'Delivered',
    order_cancelled_note: 'This order has been cancelled',

    account_dashboard_member_since: 'Member since',
    account_dashboard_last_signin: 'Last sign-in',
    account_dashboard_logout: 'Log out',
    account_dashboard_quick_access: 'Quick Access',
    account_dashboard_orders: 'My Orders',
    account_dashboard_orders_desc: 'View order history',
    account_dashboard_cart: 'Cart',
    account_dashboard_cart_desc: 'View your cart',
    account_dashboard_books: 'Browse Books',
    account_dashboard_books_desc: 'Browse all books',
    account_dashboard_decor_desc: 'Browse home decor',
    settings_menu_label: 'Settings',
    settings_language: 'Language',
    settings_theme: 'Theme',
    settings_dark_theme: 'Dark theme',
    settings_lang_bn: 'বাংলা',
    settings_lang_en: 'English',
    footer_rights: 'All rights reserved',

    // Book Request section (homepage)
    book_request_title: 'Request a Book',
    book_request_sub: "Can't find the book you're looking for? Fill out the form below — we'll source it and deliver it to your address.",
    book_request_home_teaser: "Can't find the book you want? Head over to our Book Request page and let us know — we'll source it and deliver it to your address.",
    book_request_cta_link: 'Go to Request Page',
    book_request_name_label: 'Your Name',
    book_request_name_placeholder: 'Your full name',
    book_request_phone_label: 'Contact Number',
    book_request_phone_placeholder: '+880 1XXX-XXXXXX',
    book_request_book_label: 'Book Title',
    book_request_book_placeholder: 'e.g. Sheser Kobita',
    book_request_author_label: "Author's Name",
    book_request_author_placeholder: 'e.g. Rabindranath Tagore',
    book_request_edition_label: 'Edition',
    book_request_edition_placeholder: 'e.g. 1st edition / Indian edition',
    book_request_address_label: 'Delivery Address',
    book_request_address_placeholder: 'Full address (house/road/area/city)',
    book_request_note_label: 'Additional Info (optional)',
    book_request_note_placeholder: 'Anything that would help us source this book — publisher, cover, where it can be found, etc.',
    book_request_submit: 'Send Request',
    book_request_sending: 'Sending…',
    book_request_error: 'Something went wrong. Please try again, or call us directly.',
    book_request_success_title: 'Thank you! 🎉',
    book_request_success_msg: "We've received your request. We'll be in touch with you soon.",
    book_request_close: 'OK',
    book_request_history_btn: 'History',
    book_request_new_request: 'New Request',
    book_request_login_note: 'Save your information for the future and view your request history — <a href="account.html">log in here</a>.',
    book_request_history_title: 'Your Request History',
    book_request_history_empty: "You haven't requested any books yet.",
    book_request_step1_title: 'Fill out the form',
    book_request_step1_desc: 'Book title, author, and address — takes under a minute.',
    book_request_step2_title: 'We track it down',
    book_request_step2_desc: "We'll usually call within 1–2 business days to confirm price and availability.",
    book_request_step3_title: 'It reaches your door',
    book_request_step3_desc: "Once confirmed, we source the book and deliver it straight to your address.",

    owner_orders_title: 'Order History',
    owner_orders_empty: 'No orders have come in yet.',
    owner_orders_error: 'Could not load orders. Please check your Firebase configuration.',
    login_signing_in: 'Signing in…',
    login_invalid: 'Incorrect email or password.',

    admin_books_title: 'Manage Books',
    admin_add_new: 'Add new',
    admin_add_new_book: 'Add new book',
    admin_edit_book: 'Edit book',
    admin_update_btn: 'Update',
    admin_add_book_btn: 'Add',
    admin_current_books: 'Current Books',
    admin_no_books_yet: 'No books added yet.',
    admin_confirm_delete_book: 'Delete this book?',
    admin_books_load_error: 'Could not load books. Please check your Firebase configuration.',
    admin_pages_label: 'Pages *',
    admin_select: '— Select —',
    admin_decor_title: 'Manage Decor',
    admin_add_new_item: 'Add new item',
    admin_edit_item: 'Edit item',
    admin_current_items: 'Current Items',
    admin_no_items_yet: 'No items added yet.',
    admin_confirm_delete_item: 'Delete this item?',
    admin_items_load_error: 'Could not load items. Please check your Firebase configuration.',
    admin_name_label: 'Name *',
    category_label_req: 'Category *',
    admin_image_url: 'Image URL *',
    admin_save: 'Save',
    admin_cancel: 'Cancel',
    admin_edit: 'Edit',
    admin_delete: 'Delete',
    admin_title_label: 'Title',
    admin_author_label: 'Author',
    admin_genre_label: 'Genre',
    admin_current_price: 'Current price',
    admin_regular_price: 'Regular price',
    admin_cover_url: 'Cover image URL',
    admin_in_stock: 'In stock',
    admin_save_error: 'Could not save. Please try again.'
  }
};

export function getLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'bn' ? 'bn' : 'en';
  } catch {
    return 'en';
  }
}

export function setLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang === 'bn' ? 'bn' : 'en');
  } catch {
    // localStorage unavailable — language choice just won't persist.
  }
  window.location.reload();
}

/** Translate a key to the current language (falls back to English, then the key itself). */
export function t(key) {
  const lang = getLang();
  return (dict[lang] && dict[lang][key]) || dict.en[key] || key;
}

export function applyStaticTranslations(root = document) {
  document.documentElement.lang = getLang();
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
}

// ---------- Prevent "flash of untranslated keys" ----------
// data-i18n elements start life holding their raw key text (e.g.
// "book_request_home_teaser") until this module runs and swaps in the
// real string. On a slow connection there's a visible gap between first
// paint and that swap, during which raw keys are visible. To avoid it,
// index.html/etc. set `<html class="i18n-loading">` inline (before any
// content renders) — style.css hides the whole page while that class is
// present — and this module removes the class only once translation is
// done, revealing an already-translated page with no flash.
function revealPage() {
  document.documentElement.classList.remove('i18n-loading');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyStaticTranslations();
    revealPage();
  });
} else {
  applyStaticTranslations();
  revealPage();
}
