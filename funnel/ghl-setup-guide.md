# GHL Setup Guide — Meditation Download Funnel

## Step 1: Create the Funnel Page
1. In GHL, go to Sites > Funnels
2. Create a new funnel or open existing
3. Add a new funnel step > use a **Blank Canvas**

## Step 2: Add Custom CSS
1. In the funnel editor, go to **Settings** (top bar)
2. Find **Custom CSS**
3. Paste the entire contents of `custom-css.css`
4. Save

## Step 3: Set Up the Hidden GHL Form
1. Click **Add Elements** in the editor
2. Add a **Column** at the very bottom of the page
3. Inside that column, add a **Form** element
4. Select your opt-in form (First Name, Last Name, Email)
5. In the form settings, set the **redirect URL** to your thank you page
6. Hover over the section containing the form
7. Toggle **Visibility OFF** for that section
8. Save the page
9. Go to **Layers** panel to confirm the hidden form section is there
10. Note the form's field IDs (inspect the page) — you'll need these for Step 5

## Step 4: Add Each HTML Section
For each file in the `sections/` folder, in order:
1. Click **Add Elements**
2. Add a **Custom HTML** block
3. Open the code editor
4. Paste the full contents of the section file
5. Click Save
6. Set the section **margin to 0** (top, bottom, left, right)
7. Repeat for all 6 sections

Order:
- 01-hero.html
- 02-mockup.html
- 03-form.html
- 04-social-proof.html
- 05-testimonials.html
- 06-footer.html

## Step 5: Connect the HTML Form to the Hidden GHL Form
1. Preview the page
2. Right-click > Inspect > Console
3. Run the diagnostic snippet Claude provides to find the hidden form field names
4. Update the `FIELD_MAP` object in `sections/03-form.html` with the real field names
5. Re-paste section 03 into GHL
6. Test by filling out the form and checking GHL Contacts for a new submission

## Step 6: Test
1. Fill out the visible form on the live preview
2. Check GHL > Contacts — a new contact should appear
3. Check that the redirect URL fires correctly
4. Test on mobile

## Step 7: Save as Template (Optional)
- In GHL Layers, select the blank-with-zero-margin section
- Save as a template called "Blank Zero Margin Section"
- Reuse this for future funnel builds
