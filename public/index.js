import { processDroppedFiles } from '../../../../script.js';

const importHtml = `
<div id="wyvern_import_button" class="menu_button fa-solid fa-dragon" title="Import from WyvernChat" style="order: 100;"></div>
`;

jQuery(async () => {
    // Wait for the import menu to be available
    while ($('#rm_character_import').length === 0) {
        await new Promise(r => setTimeout(r, 500));
    }
    
    $('#rm_character_import').append(importHtml);
    
    $(document).on('click', '#wyvern_import_button', async () => {
        const url = prompt('Enter WyvernChat Character URL:');
        if (!url) return;

        // Simple validation
        if (!url.includes('wyvern.chat/characters/')) {
            alert('Invalid WyvernChat URL');
            return;
        }

        try {
            // Show loading
            const btn = $('#wyvern_import_button');
            const originalIcon = btn.attr('class');
            btn.attr('class', 'menu_button fa-solid fa-spinner fa-spin');

            const response = await fetch('/api/plugins/wyvern/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) throw new Error(await response.text());

            const blob = await response.blob();
            let fileName = "character.png";
            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.includes('filename=')) {
                fileName = disposition.split('filename=')[1].replace(/"/g, '');
            }
            
            const file = new File([blob], decodeURI(fileName), { type: "image/png" });
            
            // Trigger import
            await processDroppedFiles([file]);
            
            // Restore icon
            btn.attr('class', originalIcon);
            
            // Force close menu if needed or notify
            if (typeof toastr !== 'undefined') {
                toastr.success('Character imported successfully!');
            } else {
                alert('Character imported successfully!');
            }
        } catch (err) {
            console.error(err);
            alert('Import failed: ' + err.message);
            $('#wyvern_import_button').attr('class', 'menu_button fa-solid fa-dragon');
        }
    });
});
