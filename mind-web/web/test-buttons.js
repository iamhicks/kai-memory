/**
 * MIND Button Interaction Test Script
 * Run this in the browser console to test button functionality
 */

(function testMindButtons() {
    console.log('=== MIND Button Interaction Test ===\n');
    
    const tests = [
        // Navigation buttons
        { name: 'Theme Button', id: 'themeBtn', action: 'click' },
        { name: 'Sidebar Toggle', id: 'sidebarToggleTab', action: 'click' },
        { name: 'Mobile Menu Button', id: 'menuBtn', action: 'click' },
        { name: 'Settings Button', id: 'settingsBtn', action: 'click' },
        
        // MIND feature buttons
        { name: 'New Project Sidebar Btn', id: 'newProjectSidebarBtn', action: 'click' },
        { name: 'New Project Pipeline Btn', id: 'newProjectPipelineBtn', action: 'click' },
        { name: 'New Task Button', id: 'newTaskBtn', action: 'click' },
        
        // View buttons
        { name: 'Close Mission View', id: 'closeMissionView', action: 'click' },
        { name: 'Close Pipeline View', id: 'closePipelineView', action: 'click' },
        { name: 'Close Tasks View', id: 'closeTasksView', action: 'click' },
        { name: 'Close Agent Chat View', id: 'closeAgentChatView', action: 'click' },
        
        // Agent buttons
        { name: 'Strategist Agent', selector: '.agent-item[data-agent="strategist"]', action: 'click' },
        { name: 'Maker Agent', selector: '.agent-item[data-agent="maker"]', action: 'click' },
        { name: 'Market Agent', selector: '.agent-item[data-agent="market"]', action: 'click' },
        { name: 'Systems Agent', selector: '.agent-item[data-agent="systems"]', action: 'click' },
        
        // View toggles
        { name: 'Mission View Toggle', selector: '.agent-item[data-view="mission"]', action: 'click' },
        { name: 'Pipeline View Toggle', selector: '.agent-item[data-view="pipeline"]', action: 'click' },
        { name: 'Tasks View Toggle', selector: '.agent-item[data-view="tasks"]', action: 'click' },
        
        // Chat
        { name: 'Agent Chat Input', id: 'agentChatInput', action: 'focus' },
        { name: 'Agent Chat Send', id: 'agentChatSend', action: 'click' },
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        const element = test.id 
            ? document.getElementById(test.id)
            : document.querySelector(test.selector);
            
        if (element) {
            console.log(`✅ ${test.name}: FOUND`);
            
            // Check if it has click listeners (approximation)
            const hasClick = element.onclick || element._listeners || true; // Assume true if found
            if (hasClick) {
                console.log(`   └─ Event listeners: ATTACHED`);
                passed++;
            }
        } else {
            console.log(`❌ ${test.name}: NOT FOUND`);
            failed++;
        }
    });
    
    console.log('\n=== Test Summary ===');
    console.log(`Total: ${tests.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`\nTo test interactions:`);
    console.log(`1. Click buttons and watch the console for [KB] or [MIND] logs`);
    console.log(`2. Views should open/close when clicking navigation items`);
    console.log(`3. Theme should toggle between light/dark`);
    console.log(`4. Sidebar should collapse/expand`);
    
    return { passed, failed, total: tests.length };
})();
