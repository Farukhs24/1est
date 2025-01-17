
        // Define numeric ID to name and link mapping
        const items = {
            '939243': { name: 'Sonic the Hedgehog 3', link: 'https://example.com/link1' },
            '762509': { name: 'Mufasa: The Lion King', link: 'https://example.com/link2' },
            '539972': { name: 'Kraven the Hunter', link: 'https://example.com/link3' },
        };

        // Function to display the name and handle the download button click
        function loadContent() {
            const url = new URL(window.location.href);
            const id = url.searchParams.get('id'); // Extract numeric ID from URL

            if (id && items[id]) {
                // Display the name on the page
                document.getElementById('item-name').textContent = items[id].name;
            } else {
                // Show an error if the ID is invalid
                document.getElementById('content').innerHTML = "<h2>ID not found or invalid.</h2>";
            }
        }

        function handleDownload() {
            const url = new URL(window.location.href);
            const id = url.searchParams.get('id'); // Extract numeric ID from URL

            if (id && items[id]) {
                // Redirect to the corresponding link
                window.location.href = items[id].link;
            } else {
                alert('ID not found or invalid.');
            }
        }
    
