# Likrat Kalla — Admin Manual

Welcome, Sadeena! This guide explains how to manage every part of the Likrat Kalla
website without needing any technical knowledge. Everything is done through the
**Admin Portal** — a private, password-protected area of the website.

---

## Table of Contents

1. [How to Log In](#1-how-to-log-in)
2. [The Admin Dashboard Overview](#2-the-admin-dashboard-overview)
3. [Updating Page Text (English & Hebrew)](#3-updating-page-text-english--hebrew)
4. [Managing the Gallery — Photos and Videos](#4-managing-the-gallery--photos-and-videos)
5. [Managing the Item Catalog](#5-managing-the-item-catalog)
6. [Managing Brides (Kallas)](#6-managing-brides-kallas)
7. [Prayer Submissions — Viewing and Printing](#7-prayer-submissions--viewing-and-printing)
8. [Site Settings — Prices, Event Banner, Admin Emails](#8-site-settings--prices-event-banner-admin-emails)
9. [How to Log Out](#9-how-to-log-out)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. How to Log In

1. Open your web browser (Chrome, Firefox, Safari, or Edge).
2. Go to: **`https://www.helpjewishbrides.org/en/admin/login`**
3. Enter your **email address** and **password**.
4. Click **Log in**.

You will be taken directly to the Admin Dashboard.

> 💡 **Tip:** Bookmark this link so you can find it easily next time.

> 🔒 **Security:** Only people with an admin account can log in. The admin portal
> is never visible to regular visitors of the site.

### Forgot your password?

Contact the site developer to reset your password, or use the Supabase dashboard
if you have access to it.

---

## 2. The Admin Dashboard Overview

After logging in, you will see the Admin Dashboard with links to 6 sections:

| Section | What you can do |
|---|---|
| **Content** | Edit all text on the website in English and Hebrew |
| **Media** | Upload photos and add YouTube video links |
| **Catalog** | Add, edit, or remove household gift items |
| **Brides** | Add anonymous bride profiles and wedding dates |
| **Prayers** | View prayer submissions and print prayer sheets |
| **Settings** | Set package price, admin emails, Chinese Auction dates |

Click any section name to open it.

---

## 3. Updating Page Text (English & Hebrew)

This section lets you change any text that appears on the public website — headlines,
descriptions, mission statements, contact information, and more.

### How to edit text

1. Click **Content** in the admin menu.
2. You will see a list of all editable text sections (e.g., *Hero Title*, *About Story*,
   *Contact Phone*).
3. Each item shows the current **English** text and the current **Hebrew** text.
4. Click the **Edit** button (pencil icon) next to the section you want to change.
5. Update the text in the English field and/or the Hebrew field.
6. Click **Save** when finished.

The change will appear on the public website immediately after saving.

> 💡 **Tip:** Always fill in **both** the English and Hebrew versions. Visitors who
> switch the site to Hebrew will see the Hebrew version, and vice versa.

> 📝 **Note:** Some fields support simple formatting (bold, paragraphs). Most fields
> are plain text. Do not paste content from Microsoft Word — type directly or paste
> as plain text to avoid formatting issues.

---

## 4. Managing the Gallery — Photos and Videos

The About Us page displays a categorized gallery of photos and videos. You can add new
items, change their order, and remove old ones.

### 4.1 Adding a new photo

1. Click **Media** in the admin menu.
2. Click **Upload Photo**.
3. Click **Choose file** and select a photo from your computer.
   - Best formats: JPG or PNG.
   - Recommended size: under 5 MB per photo.
4. Fill in the details:
   - **Title (English):** A short caption (e.g., "Distribution Day 2024").
   - **Title (Hebrew):** The same caption in Hebrew.
   - **Section:** Choose where this photo belongs:
     - *About Gallery* — the main categorized gallery on the About page.
     - *Landing Carousel* — the hero slideshow on the homepage.
   - **Category** (for About Gallery photos only): Choose the correct category:
     - *Yearly Events*
     - *Parlor Meetings*
     - *Distribution Days*
     - *Special Videos*
5. Click **Save** to upload.

The photo will appear in the selected section of the website immediately.

### 4.2 Adding a YouTube video

1. Click **Media** in the admin menu.
2. Click **Add Video**.
3. Go to YouTube, open the video you want to feature, and copy its URL from the
   address bar (e.g., `https://www.youtube.com/watch?v=XXXXXXXXXXX`).
4. Paste the YouTube URL into the **Video URL** field.
5. Fill in the **Title (English)** and **Title (Hebrew)**.
6. Select the **Section** and **Category** (same options as photos above).
7. Click **Save**.

The video will be embedded and playable directly on the website.

### 4.3 Changing the display order

1. In the **Media** section, find the photos or videos you want to reorder.
2. Use the **up ▲ / down ▼ arrow buttons** next to each item to move it.
3. The order updates automatically — there is no separate Save button for ordering.

### 4.4 Hiding or removing a photo/video

- **To hide temporarily:** Click **Edit** on the item and uncheck the **Active** toggle.
  The item will not appear on the public site but remains saved for later.
- **To remove permanently:** Click the **Delete** (trash) button and confirm.

---

## 5. Managing the Item Catalog

The catalog shows the household gifts that donors can choose to sponsor. Each item has
a name, description, photo, and price.

### 5.1 Adding a new catalog item

1. Click **Catalog** in the admin menu.
2. Click **Add Item**.
3. Fill in all the fields:
   - **Title (English)** and **Title (Hebrew):** The gift name.
   - **Description (English)** and **Description (Hebrew):** A short description.
   - **Price (NIS):** The cost of sponsoring this item, in Israeli Shekels.
   - **Category:**
     - *Core Package Item* — items included in every package.
     - *Random Choice Item* — items given based on availability.
   - **Photo:** Click **Choose file** to upload a product photo.
4. Click **Save**.

### 5.2 Editing an existing item

1. In the **Catalog** list, find the item you want to change.
2. Click **Edit** (pencil icon).
3. Update any fields and click **Save**.

### 5.3 Changing prices

1. Find the item in the Catalog list.
2. Click **Edit** → update the **Price (NIS)** field → click **Save**.

> 💡 **Note:** The standard package sponsorship amount (default: 500 NIS) is a separate
> setting — see **[Section 8: Site Settings](#8-site-settings--prices-event-banner-admin-emails)**.

### 5.4 Removing or hiding an item

- **To hide:** Click **Edit** → uncheck **Active** → click **Save**.
  Inactive items do not appear in the public catalog.
- **To delete permanently:** Click the **Delete** button next to the item and confirm.

---

## 6. Managing Brides (Kallas)

This section lets you add anonymous bride profiles that donors can choose to sponsor.
Brides are shown by their upcoming wedding date and an anonymous story.

> 🔒 **Privacy:** Never include any names, surnames, neighborhood names, or identifying
> details in the bride profiles. All stories must remain completely anonymous.

### 6.1 Adding a new bride profile

1. Click **Brides** (Kallas) in the admin menu.
2. Click **Add Bride**.
3. Fill in:
   - **Wedding Date:** The bride's upcoming wedding date.
   - **Story (English):** A short, anonymous description of her situation
     (e.g., "A young kallah whose family faces financial hardship…").
   - **Story (Hebrew):** The same story in Hebrew.
   - **Target Amount (NIS):** How much is needed to fully sponsor her package
     (default: 500 NIS — leave as is unless her needs differ).
4. Click **Save**.

The bride will appear in the "Sponsor a Kalla" section of the Donate page, filterable
by wedding date.

### 6.2 Marking a bride as sponsored

When a donor has fully sponsored a bride:

1. Find the bride in the Brides list.
2. Click **Edit** → toggle **Sponsored** to ON → click **Save**.

Sponsored brides are marked clearly in the admin list. They remain visible on the
public site (to thank donors for the support) until you choose to hide them.

### 6.3 Removing past or outdated bride profiles

To keep the list current, remove brides whose wedding date has passed:

1. In the **Brides** list, look for profiles with past wedding dates.
2. Click **Delete** next to each past bride and confirm.

> 💡 **Tip:** Do this monthly, after the end of each Jewish month, to keep the
> active list clean and relevant for donors.

---

## 7. Prayer Submissions — Viewing and Printing

Every time a donor sponsors a package or a bride, they can enter up to 3 names to be
prayed for by the bride on her wedding day. These submissions are automatically saved
here.

### 7.1 Viewing prayer submissions

1. Click **Prayers** in the admin menu.
2. You will see a list of all submissions, showing:
   - Donor name and email.
   - Sponsorship type (package, catalog, or specific bride).
   - Amount donated.
   - The names and prayer reasons submitted.
   - The date and time of submission.
3. Use the **search bar** to look up a specific donor by name or email.

### 7.2 Printing the prayer sheet for a distribution day

The print view produces a clean, formatted list of all names to be prayed for — sized
for handing directly to the brides on distribution days.

1. Click **Prayers** in the admin menu.
2. Click **Print View** (or the printer icon 🖨️ at the top).
3. A clean, print-formatted page will open showing all the prayer names grouped
   by reason (Refuah Shleima, Zivug, etc.).
4. Press **Ctrl + P** (Windows) or **⌘ + P** (Mac) to open the print dialog.
5. Choose your printer and click **Print**.

> 💡 **Tip:** Before printing, use the **date filter** to print only submissions
> from the current period if needed.

### 7.3 Managing prayer reason categories

The dropdown that donors see when entering prayer names (Refuah Shleima, Zivug Hagun,
etc.) can be updated here if needed.

To add, rename, or hide a reason:

1. Click **Prayers** → **Manage Reasons** (if available in the menu).
2. Edit the English and Hebrew labels, change the display order, or mark a reason
   as inactive to remove it from the donor-facing dropdown.

---

## 8. Site Settings — Prices, Event Banner, Admin Emails

### 8.1 Changing the package sponsorship price

1. Click **Settings** in the admin menu.
2. Find **Package Cost (NIS)**.
3. Update the amount and click **Save**.

This changes the price shown on the "Sponsor a Package" donation page and the amount
sent to the Lemaan Achai payment portal.

### 8.2 Managing admin notification emails

When a donor submits a prayer request, an email notification is sent automatically to
the admin email addresses listed here.

1. Click **Settings** → find **Admin Notification Emails**.
2. Enter one email address per line (or a comma-separated list, depending on the form).
3. Click **Save**.

> 💡 **Tip:** Include at least 2 email addresses (e.g., Sadeena's and her husband's)
> so notifications are never missed.

### 8.3 Turning the Chinese Auction event banner on or off

The website can show a special banner and navigation link to the annual Chinese Auction
at `www.lkauction.com`. You can schedule exactly when it appears and disappears.

1. Click **Settings** → find **Chinese Auction / Event Banner**.
2. You will see these fields:
   - **Enabled:** Toggle ON to allow the banner to show; OFF to always hide it.
   - **Start Date:** The banner will start showing on this date (e.g., January 1, 2026).
   - **End Date:** The banner will automatically disappear after this date (e.g., March 31, 2026).
   - **Event URL:** The link the banner points to (default: `https://www.lkauction.com`).
3. Set the dates and toggle **Enabled** ON.
4. Click **Save**.

> The banner appears automatically when today's date falls between Start Date and End Date,
> and disappears on its own the day after End Date — no further action needed from you.

> To hide the banner at any time, toggle **Enabled** to OFF and save.

---

## 9. How to Log Out

1. In the Admin Portal, look for your name or email in the top-right corner.
2. Click it → select **Log out**.
3. You will be returned to the login page.

> 🔒 **Always log out** when you are finished, especially on shared or public computers.

---

## 10. Troubleshooting

### The site is not showing my updated text

- Wait 10–15 seconds and refresh the public page (press **F5** or **⌘ + R**).
- Make sure you clicked **Save** after making the change (look for a green "Saved"
  confirmation message in the admin).
- If the problem persists, try logging out and logging back in, then make the change again.

### A photo I uploaded is not showing

- Check that the item's **Active** toggle is turned ON in the Media section.
- Make sure the correct **Section** was selected when uploading.
- Very large photos (over 10 MB) may fail silently — compress the photo and try again.
  Free tool: [https://squoosh.app](https://squoosh.app)

### I am not receiving prayer submission emails

- Check your spam/junk folder.
- Confirm your email address is listed correctly in **Settings → Admin Notification Emails**.
- Contact the site developer to verify the email service (Resend) is properly configured.

### I forgot my password

- Contact the site developer — they can reset your password through the Supabase dashboard.
- A self-service password reset feature may be added in a future update.

### The Chinese Auction banner is not showing even though I turned it on

- Make sure today's date falls **between** the Start Date and End Date you entered.
- Make sure **Enabled** is toggled ON and you clicked **Save**.
- Refresh the public homepage (not the admin page) to check.

### I accidentally deleted something

- Deletions are permanent and cannot be undone through the admin portal.
- For critical data (e.g., a bride profile or prayer submissions), contact the developer
  who may be able to restore from a Supabase database backup (Supabase retains 7 days
  of point-in-time recovery on the free tier).

---

## Quick Reference Card

| I want to… | Where to go |
|---|---|
| Change homepage headline | Content → Edit "Hero Title" |
| Change About Us story text | Content → Edit "About Story" |
| Update contact phone number | Content → Edit "Contact Phone" |
| Add a new gallery photo | Media → Upload Photo |
| Add a YouTube video | Media → Add Video |
| Change a gift item's price | Catalog → Edit item → update Price |
| Add a new bride profile | Brides → Add Bride |
| Remove a past wedding date | Brides → Delete that bride |
| Print today's prayer list | Prayers → Print View → Ctrl+P |
| Change package price | Settings → Package Cost |
| Turn auction banner on | Settings → Chinese Auction → Enabled ON + set dates |
| Turn auction banner off | Settings → Chinese Auction → Enabled OFF |
| Add another admin email | Settings → Admin Notification Emails |

---

*For technical issues beyond this guide, please contact the site developer.*
