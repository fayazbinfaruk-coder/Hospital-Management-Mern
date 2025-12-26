# Chatbot Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend running on `http://localhost:5173`
3. MongoDB connected with seeded doctor data
4. Logged in as a patient user

### Test Steps

#### 1. Access the Chatbot
1. Navigate to Patient Dashboard
2. Look for the floating AI button in the bottom-right corner
3. Click the button to open the chatbot

#### 2. Test Welcome Message
- Chatbot should automatically greet you with your name
- Should see quick suggestion buttons

#### 3. Test Symptom Recognition

**Test Case 1: Gastritis**
```
Input: "I have stomach pain and nausea"
Expected: 
- Suggests Gastroenterologist
- Provides home remedies (hydration, bland foods)
- Shows available gastroenterologists
```

**Test Case 2: Headache**
```
Input: "I have a severe headache"
Expected:
- Suggests Neurologist
- Provides first aid tips
- Shows neurologists in system
```

**Test Case 3: Chest Pain**
```
Input: "I have chest pain"
Expected:
- Suggests Cardiologist
- Emergency warning included
- Shows cardiologists
```

**Test Case 4: Skin Issues**
```
Input: "I have skin rash and itching"
Expected:
- Suggests Dermatologist
- Home care tips
- Available dermatologists
```

#### 4. Test Quick Suggestions
- Click "Stomach issues" button
- Should auto-fill message about stomach pain
- Should send automatically

#### 5. Test Unknown Symptoms
```
Input: "I feel tired"
Expected:
- Asks for more specific details
- Provides guidance on what info to share
```

#### 6. Test Conversation Flow
```
Input: "Thank you"
Expected:
- Polite goodbye message
- Well wishes for health
```

### Expected Behavior

✅ **Should Work**:
- Welcome message with patient name
- Symptom analysis and doctor suggestions
- Home remedy recommendations
- Smooth scrolling to latest message
- Loading indicator while processing
- Formatted messages (bold, bullets)
- Quick suggestion buttons

❌ **Should NOT**:
- Suggest medicine
- Diagnose conditions
- Provide medical treatment
- Work without authentication

### Browser Console Tests

Open browser console and check:

```javascript
// Check if token exists
localStorage.getItem('token')

// Should return JWT token

// Check API endpoint
fetch('http://localhost:5000/api/chatbot/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    message: 'I have a headache',
    conversationHistory: []
  })
})
.then(r => r.json())
.then(console.log)
```

### Visual Checks

#### Chatbot UI
- [ ] Gradient header (purple)
- [ ] Bot icon and status indicator
- [ ] Close button works
- [ ] Messages appear in bubbles
- [ ] User messages on right (pink gradient)
- [ ] Bot messages on left (white)
- [ ] Timestamps visible
- [ ] Input textarea expands
- [ ] Send button enabled/disabled correctly
- [ ] Smooth animations

#### Dashboard Integration
- [ ] Floating button visible
- [ ] Button has AI badge
- [ ] Hover effect on button
- [ ] Button opens chatbot
- [ ] Chatbot closes with X button

### Sample Test Conversations

#### Conversation 1: Successful Recommendation
```
Patient: Hello
Chatbot: [Welcome message with name]

Patient: I have gastritis and stomach pain
Chatbot: [Suggests Gastroenterologist]
        [Home remedies]
        [Dr. Mahbub Khan details]

Patient: Thank you
Chatbot: [Farewell message]
```

#### Conversation 2: Multiple Symptoms
```
Patient: I have headache and dizziness
Chatbot: [Suggests Neurologist]
        [Home remedies for headache]
        [Available neurologists]
```

#### Conversation 3: Vague Symptoms
```
Patient: I don't feel well
Chatbot: [Asks for more details]
        [Guides what info to provide]
```

### API Testing with Postman/Thunder Client

#### Endpoint 1: Chat
```
POST http://localhost:5000/api/chatbot/chat
Headers:
  Authorization: Bearer <your_token>
  Content-Type: application/json

Body:
{
  "message": "I have chest pain",
  "conversationHistory": []
}
```

#### Endpoint 2: Specializations
```
GET http://localhost:5000/api/chatbot/specializations
Headers:
  Authorization: Bearer <your_token>
```

### Debugging Tips

**Issue**: Chatbot not opening
- Check console for errors
- Verify Chatbot component import
- Check if isChatbotOpen state changes

**Issue**: No doctors shown
- Verify doctors exist in database
- Check specialization spelling
- Run doctor seed script: `node server/seed/createDoctors.js`

**Issue**: Messages not sending
- Check backend server is running
- Verify token in localStorage
- Check network tab for API errors
- Ensure CORS is configured

**Issue**: Styling issues
- Verify Chatbot.css is imported
- Check Tailwind CSS is working
- Clear browser cache

### Performance Checks

- [ ] Chat opens within 1 second
- [ ] Messages send instantly
- [ ] No lag when typing
- [ ] Smooth scroll animation
- [ ] No memory leaks (check with React DevTools)

### Mobile Testing

Test on mobile viewport (or DevTools mobile view):

- [ ] Chatbot takes full screen
- [ ] Messages readable
- [ ] Input accessible
- [ ] Buttons clickable
- [ ] Suggestions wrap correctly
- [ ] Close button accessible

### Accessibility Checks

- [ ] Can navigate with keyboard
- [ ] Enter key sends message
- [ ] Focus indicators visible
- [ ] Colors have good contrast
- [ ] Screen reader compatible (aria labels)

## Automated Test Script

Create a test file to automate testing:

```javascript
// test-chatbot.js
const testCases = [
  { input: 'stomach pain', expects: 'Gastroenterologist' },
  { input: 'headache', expects: 'Neurologist' },
  { input: 'chest pain', expects: 'Cardiologist' },
  { input: 'skin rash', expects: 'Dermatologist' },
  { input: 'broken bone', expects: 'Orthopedic Surgeon' },
];

async function testChatbot() {
  const token = 'your_token_here';
  
  for (const test of testCases) {
    const response = await fetch('http://localhost:5000/api/chatbot/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: test.input,
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    const passed = data.specialization === test.expects;
    
    console.log(`Test: "${test.input}"`);
    console.log(`Expected: ${test.expects}`);
    console.log(`Got: ${data.specialization}`);
    console.log(`Status: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);
  }
}

testChatbot();
```

## Sign-off Checklist

Before deploying:

- [ ] All test cases pass
- [ ] No console errors
- [ ] UI looks good on desktop
- [ ] UI looks good on mobile
- [ ] Authentication works
- [ ] Doctors are properly recommended
- [ ] Home remedies display correctly
- [ ] Emergency warnings present
- [ ] Performance is acceptable
- [ ] Code is documented
- [ ] README updated

---

**Testing Complete**: Once all checks pass, the chatbot is ready for production use! 🎉
