let highestZIndex = 0;
let offsetX = 0;
let offsetY = 0;
let activeCollections = new Set();
let activeColors = new Set();
let activeCategories = new Set();
let activeFootprints = new Set();
let collections = new Set();
let colors = new Set();
let categories = new Set();
let footprints = new Set();
let currentWallpaper = null;
let currentFlooring = null;
let currentBackground = null;
let activeCategoriesWallpaperFlooring = new Set();
let activeCollectionsWallpaperFlooring = new Set();
let activeColorsWallpaperFlooring = new Set();
let categoriesWallpaperFlooring = new Set();
let collectionsWallpaperFlooring = new Set();
let colorsWallpaperFlooring = new Set();
let activeCollectionsBackgrounds = new Set();
let activeColorsBackgrounds = new Set();
let collectionsBackgrounds = new Set();
let colorsBackgrounds = new Set();

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    document.querySelector('#leftTabs .tablinks').click();

    fetch('wallfloor.json')
        .then(response => response.json())
        .then(data => {
            const defaultWallpaper = data.find(item => item.name === 'Default Wallpaper');
            const defaultFlooring = data.find(item => item.name === 'Default Flooring');

            if (defaultWallpaper) {
                setDefaultItem(defaultWallpaper);
            }

            if (defaultFlooring) {
                setDefaultItem(defaultFlooring);
            }

            loadWallpaperFlooring();
        })
        .catch(error => console.error('Error fetching JSON:', error));

    fetch('backgrounds.json')
        .then(response => response.json())
        .then(data => {
            const defaultBackground = data.find(item => item.name === 'Default Background');
            if (defaultBackground) {
                setDefaultBackground(defaultBackground);
            }

            loadBackgrounds();
        })
        .catch(error => console.error('Error fetching JSON:', error));
        
    fetch('catalog.json')
        .then(response => response.json())
        .then(data => {
            loadItems(data);
            loadFilters(data);
        })
        .catch(error => console.error('Error fetching JSON:', error));
        
    document.querySelectorAll('.dropdown-button').forEach(button => {
        button.addEventListener('click', function() {
            const dropdown = this.nextElementSibling;
            const isDisplayed = dropdown.classList.contains('show');
    
            // Close all dropdowns
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.classList.remove('show');
            });
    
            // Remove 'show' class from all buttons
            document.querySelectorAll('.dropdown-button').forEach(btn => {
                btn.classList.remove('show');
            });
    
            // Toggle current dropdown and button 'show' class
            if (!isDisplayed) {
                dropdown.classList.add('show');
                this.classList.add('show');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-button')) {
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-button').forEach(btn => {
                btn.classList.remove('show');
            });
        }
    });

    document.getElementById('resetAllFiltersButton').addEventListener('click', resetAllFilters);
    document.getElementById('resetAllFiltersButtonWallpaperFlooring').addEventListener('click', resetAllFiltersWallpaperFlooring);
});

function attachCheckboxListeners() {
    const footprintCheckboxes = document.querySelectorAll('.footprint-checkbox');

    footprintCheckboxes.forEach(function(checkbox) {
        checkbox.removeEventListener('click', toggleCheckbox); // Ensure no duplicate listeners
        checkbox.addEventListener('click', toggleCheckbox);
    });
}

function toggleCheckbox(event) {
    const checkbox = event.currentTarget;
    if (checkbox.classList.contains('checkbox_off')) {
        checkbox.classList.remove('checkbox_off');
        checkbox.classList.add('checkbox_on');
        checkbox.src = 'assets/icons/items/footprint/checkbox_on.png';
    } else {
        checkbox.classList.remove('checkbox_on');
        checkbox.classList.add('checkbox_off');
        checkbox.src = 'assets/icons/items/footprint/checkbox_off.png';
    }
}

function openLeftTab(evt, tabName) {
    const tabContents = document.getElementsByClassName('leftTabContent');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none';
    }

    const tabLinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(' active', '');
    }

    document.getElementById(tabName).style.display = 'block';
    evt.currentTarget.className += ' active';

    // Show or hide the filter container based on the tab
    if (tabName === 'Items') {
        document.getElementById('filterContainer').style.display = 'flex';
        document.getElementById('filterContainerWallpaperFlooring').style.display = 'none';
        document.getElementById('filterContainerBackgrounds').style.display = 'none';
        document.getElementById('settingsContainer').style.display = 'none';
    } else if (tabName === 'WallpaperFlooring') {
        document.getElementById('filterContainer').style.display = 'none';
        document.getElementById('filterContainerWallpaperFlooring').style.display = 'flex';
        document.getElementById('filterContainerBackgrounds').style.display = 'none';
        document.getElementById('settingsContainer').style.display = 'none';
    } else if (tabName === 'Backgrounds') {
        document.getElementById('filterContainer').style.display = 'none';
        document.getElementById('filterContainerWallpaperFlooring').style.display = 'none';
        document.getElementById('filterContainerBackgrounds').style.display = 'flex';
        document.getElementById('settingsContainer').style.display = 'none';
    } else if (tabName === 'Settings') {
        document.getElementById('filterContainer').style.display = 'none';
        document.getElementById('filterContainerWallpaperFlooring').style.display = 'none';
        document.getElementById('filterContainerBackgrounds').style.display = 'none';
        document.getElementById('settingsContainer').style.display = 'block';
    } else {
        document.getElementById('filterContainer').style.display = 'none';
        document.getElementById('filterContainerWallpaperFlooring').style.display = 'none';
        document.getElementById('filterContainerBackgrounds').style.display = 'none';
        document.getElementById('settingsContainer').style.display = 'none';
    }
}

function setDefaultItem(item) {
    const imgElement = document.createElement('img');
    imgElement.src = 'images/wallfloor/' + item.views[2]; // Use the "large" view
    imgElement.style.left = item.fixedLocationLeft;
    imgElement.style.top = item.fixedLocationTop;
    imgElement.style.position = 'absolute';
    imgElement.classList.add('background');

    imgElement.dataset.category = item.category;
    imgElement.dataset.dropImage = 'images/wallfloor/' + item.views[2];
    imgElement.dataset.fixedLocationLeft = item.fixedLocationLeft;
    imgElement.dataset.fixedLocationTop = item.fixedLocationTop;
    
    if (item.category.toLowerCase() === 'wallpaper') {
        imgElement.id = 'wallpaper';
        currentWallpaper = imgElement;
    } else if (item.category.toLowerCase() === 'flooring') {
        imgElement.id = 'flooring';
        currentFlooring = imgElement;
    }

    document.getElementById('dropZone').appendChild(imgElement);
}

function setDefaultBackground(item) {
    const imgElement = document.getElementById('background');
    imgElement.src = 'images/backgrounds/' + item.dropImage;
    imgElement.style.left = '0px';
    imgElement.style.top = '0px';
    currentBackground = imgElement;
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const isDisplayed = dropdown.classList.contains('show');

    // Close all dropdowns except the one being toggled
    document.querySelectorAll('.dropdown-content').forEach(content => {
        if (content.id !== dropdownId) {
            content.classList.remove('show');
            content.style.display = 'none';
        }
    });

    // Toggle only the clicked dropdown
    if (isDisplayed) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
    } else {
        dropdown.classList.add('show');
        dropdown.style.display = 'block';
    }
}

// Ensure dropdowns don't close when clicking inside them
document.querySelectorAll('.dropdown-content').forEach(dropdown => {
    dropdown.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevents closing when clicking inside the dropdown
    });
});

function resetAllFilters() {
    // Reset all footprint checkboxes to checkbox_off.png
    const footprintCheckboxes = document.querySelectorAll('.footprint-checkbox');

    footprintCheckboxes.forEach(function(checkbox) {
        checkbox.classList.remove('checkbox_on');
        checkbox.classList.add('checkbox_off');
        checkbox.src = 'assets/icons/items/footprint/checkbox_off.png';
    });

    // Clear other filters if needed
    activeCollections.clear();
    activeColors.clear();
    activeCategories.clear();
    activeFootprints.clear();
    document.getElementById('collectionsButton').textContent = 'Collections';
    document.getElementById('colorsButton').textContent = 'Colors';
    document.getElementById('categoriesButton').textContent = 'Category';
    document.getElementById('footprintButton').textContent = 'Footprint';

    // Remove the highlight from filter options
    const buttons = document.querySelectorAll('.collection-button, .color-button, .category-button, .footprint-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Close all dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'));

    filterItems(); // Reapply filter
}

function loadCollections(collections) {
    const collectionButtonsContainer = document.getElementById('collectionsDropdown');
    collectionButtonsContainer.innerHTML = '';

    const sortedCollections = Array.from(collections).sort();

    sortedCollections.forEach(collection => {
        if (collection.trim() === '') return;

        const normalizedCollection = collection.split(/,\s*/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(', ');

        const iconMap = {
            'Bags & Baskets': 'bags&baskets.png',
            'Decorative Food': 'decorativefood.png',
            'Ponds & Lakes': 'ponds&lakes.png',
            'Room Dividers': 'roomdividers.png',
            'Windows & Doors': 'windows&doors.png',
            'Wishing Wells': 'wishingwells.png'
        };

        const icon = iconMap[normalizedCollection] || `${normalizedCollection.replace(/ /g, '').toLowerCase()}.png`;

        const button = document.createElement('div');
        button.className = 'collection-button';
        button.innerHTML = `
            <img src="assets/icons/items/collections/${icon}" alt="${normalizedCollection}" class="icon">
            <span>${normalizedCollection}</span>
        `;
        button.onclick = () => {
            const isActive = !button.classList.contains('active');
            setActiveCollection(normalizedCollection, isActive);
        };
        collectionButtonsContainer.appendChild(button);
    });
}

function loadColors(colors) {
    const colorButtonsContainer = document.getElementById('colorsDropdown');
    colorButtonsContainer.innerHTML = '';

    const sortedColors = [
        "Red", "Orange", "Yellow", "Green", "Blue", "Purple",
        "Pink", "Brown", "Gray", "Black", "White", "Gold", "Rainbow"
    ];

    sortedColors.forEach(color => {
        if (colors.map(c => c.toLowerCase()).includes(color.toLowerCase())) {
            const button = document.createElement('div');
            button.className = 'color-button';
            button.innerHTML = `
                <div class="color-icon" style="background-image: url('assets/icons/items/colors/${color.toLowerCase()}.png');"></div>
                <span>${color}</span>
            `;
            button.onclick = () => {
                const isActive = !button.classList.contains('active');
                setActiveColor(color, isActive);
            };
            colorButtonsContainer.appendChild(button);
        }
    });
}

function loadCategories(categories) {
    const categoryButtonsContainer = document.getElementById('categoriesDropdown');
    categoryButtonsContainer.innerHTML = '';

    const iconMap = {
        'Furniture': 'furniture.png',
        'Object': 'object.png',
        'Wall Item': 'wallitem.png',
        'Tile, Rug': 'tilerug.png'
    };

    const sortedCategories = Array.from(categories).sort();

    sortedCategories.forEach(category => {
        if (category.trim() === '') return;

        let normalizedCategory = category.split(/,\s*/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(', ');

        if (category.toLowerCase() === 'wall item') {
            normalizedCategory = 'Wall Item';
        }

        const button = document.createElement('div');
        button.className = 'category-button';
        const icon = iconMap[normalizedCategory] ? `<img src="assets/icons/items/category/${iconMap[normalizedCategory]}" alt="${normalizedCategory}" class="icon">` : '';
        button.innerHTML = `${icon} <span>${normalizedCategory}</span>`;
        button.onclick = () => {
            const isActive = !button.classList.contains('active');
            setActiveCategory(normalizedCategory, isActive);
        };
        categoryButtonsContainer.appendChild(button);
    });
}

function loadFootprints(footprints) {
    const footprintButtonsContainer = document.getElementById('footprintDropdown');
    footprintButtonsContainer.innerHTML = '';

    const sortedFootprints = Array.from(footprints).sort();

    sortedFootprints.forEach(footprint => {
        if (footprint.trim() === '') return;
        const button = document.createElement('div');
        button.className = 'footprint-button';
        button.innerHTML = `
            <img src="assets/icons/items/footprint/checkbox_off.png" alt="Checkbox Off" class="checkbox-icon footprint-checkbox">
            <span>${footprint}</span>
        `;
        button.onclick = () => {
            const isActive = !button.classList.contains('active');
            setActiveFootprint(footprint, isActive);
        };
        footprintButtonsContainer.appendChild(button);
    });

    attachCheckboxListeners(); // Add this line to attach listeners
}

function loadItems(data) {
    const allTab = document.getElementById('AllItems');
    allTab.innerHTML = ''; // Clear existing items

    collections.clear();
    colors.clear();
    categories.clear();
    footprints.clear();

    data.forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'catalog-item';
        itemContainer.dataset.category = item.category;
        itemContainer.dataset.collection = item.collection ? item.collection.toLowerCase() : '';
        itemContainer.dataset.colors = JSON.stringify(item.colors ? item.colors.map(color => color.toLowerCase()) : []);
        itemContainer.dataset.footprint = item.footprint ? item.footprint.toLowerCase() : '';

        collections.add(item.collection ? item.collection.toLowerCase() : '');
        (item.colors || []).forEach(color => colors.add(color.toLowerCase()));
        categories.add(item.category.toLowerCase());
        footprints.add(item.footprint.toLowerCase());

        const img = document.createElement('img');
        img.id = item.name;
        img.src = 'images/items/' + item.catalogImage;
        img.alt = item.name;
        img.draggable = true;
        img.dataset.dropImage = 'images/items/' + item.views[0];
        img.dataset.views = JSON.stringify(item.views.map(view => 'images/items/' + view));
        img.dataset.source = 'catalog';
        img.dataset.category = item.category;
        img.dataset.collection = JSON.stringify(Array.isArray(item.collection) ? item.collection : [item.collection]);
        img.dataset.colors = JSON.stringify(item.colors);
        img.dataset.footprint = item.footprint;
        img.ondragstart = drag;
        img.addEventListener('dblclick', () => openPopup(img));

        const label = document.createElement('div');
        label.classList.add('item-label');
        label.textContent = item.name

        itemContainer.appendChild(img);
        itemContainer.appendChild(label);

        allTab.appendChild(itemContainer);
    });

    loadCollections([...collections]);
    loadColors([...colors]);
    loadCategories([...categories]);
    loadFootprints([...footprints]);

    filterItems(); // Initialize the filter on load
}

function loadFilters(data) {
    const categories = new Set();
    const collections = new Set();
    const colors = new Set();
    const footprints = new Set();

    data.forEach(item => {
        categories.add(item.category);
        collections.add(item.collection);
        (item.colors || []).forEach(color => colors.add(color));
        footprints.add(item.footprint);
    });

    loadCollections([...collections]);
    loadColors([...colors]);
    loadCategories([...categories]);
    loadFootprints([...footprints]);
}

function filterItems() {
    const items = document.getElementsByClassName('catalog-item');

    for (let item of items) {
        const itemCategories = (item.getAttribute('data-category') || '').toLowerCase().split(',').map(cat => cat.trim());
        const itemCollections = (item.getAttribute('data-collection') || '').toLowerCase().split(',').map(col => col.trim());
        const itemColors = JSON.parse(item.getAttribute('data-colors') || '[]').map(col => col.toLowerCase());
        const itemFootprints = (item.getAttribute('data-footprint') || '').toLowerCase().split(',').map(fp => fp.trim());

        const matchesCategory = !activeCategories.size || [...activeCategories].some(category => itemCategories.includes(category.toLowerCase()));
        const matchesCollection = !activeCollections.size || [...activeCollections].some(collection => itemCollections.includes(collection.toLowerCase()));
        const matchesColor = !activeColors.size || [...activeColors].some(color => itemColors.includes(color.toLowerCase()));
        const matchesFootprint = !activeFootprints.size || [...activeFootprints].some(footprint => itemFootprints.includes(footprint.toLowerCase()));

        if (matchesCategory && matchesCollection && matchesColor && matchesFootprint) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    }
}

function searchItemsLeft() {
    const searchTerm = document.getElementById('searchInputLeft').value.toLowerCase().trim();
    const items = Array.from(document.querySelectorAll('#AllItems .catalog-item'));
    
    // If search is empty, just apply filters without search
    if (!searchTerm) {
        items.forEach(item => {
            // Get item properties for filtering
            const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';
            const itemCollection = item.dataset.collection ? item.dataset.collection.toLowerCase() : '';
            const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(c => c.toLowerCase()) : [];
            const itemFootprint = item.dataset.footprint ? item.dataset.footprint.toLowerCase() : '';

            // Check active filters
            const matchesCategory = activeCategories.size === 0 || 
                [...activeCategories].some(cat => itemCategory.includes(cat.toLowerCase()));
            const matchesCollection = activeCollections.size === 0 || 
                [...activeCollections].some(col => itemCollection.includes(col.toLowerCase()));
            const matchesColor = activeColors.size === 0 || 
                [...activeColors].some(color => itemColors.includes(color.toLowerCase()));
            const matchesFootprint = activeFootprints.size === 0 || 
                [...activeFootprints].some(fp => itemFootprint.includes(fp.toLowerCase()));

            // Show/hide based on filters only
            item.style.display = (matchesCollection && matchesColor && matchesCategory && matchesFootprint) ? 'block' : 'none';
        });
        return;
    }

    // Arrays to categorize matches
    const exactFullMatches = [];
    const exactWordMatches = [];
    const substringMatches = [];
    const fuzzyMatches = [];

    items.forEach(item => {
        // Get item name
        const itemName = item.querySelector('p')?.textContent?.trim() || '';
        const itemNameLower = itemName.toLowerCase();
        const itemWords = itemNameLower.split(/\s+/);
        
        // Get item properties for filtering
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';
        const itemCollection = item.dataset.collection ? item.dataset.collection.toLowerCase() : '';
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(c => c.toLowerCase()) : [];
        const itemFootprint = item.dataset.footprint ? item.dataset.footprint.toLowerCase() : '';

        // Check active filters
        const matchesCategory = activeCategories.size === 0 || 
            [...activeCategories].some(cat => itemCategory.includes(cat.toLowerCase()));
        const matchesCollection = activeCollections.size === 0 || 
            [...activeCollections].some(col => itemCollection.includes(col.toLowerCase()));
        const matchesColor = activeColors.size === 0 || 
            [...activeColors].some(color => itemColors.includes(color.toLowerCase()));
        const matchesFootprint = activeFootprints.size === 0 || 
            [...activeFootprints].some(fp => itemFootprint.includes(fp.toLowerCase()));

        // Skip if doesn't match filters
        if (!matchesCollection || !matchesColor || !matchesCategory || !matchesFootprint) {
            item.style.display = 'none';
            return;
        }

        // Check match type
        if (itemNameLower === searchTerm) {
            // Priority 1: Exact full name match
            exactFullMatches.push({ item, name: itemName });
        } else if (itemWords.includes(searchTerm)) {
            // Priority 2: Exact word match
            exactWordMatches.push({ item, name: itemName });
        } else if (itemNameLower.includes(searchTerm)) {
            // Priority 3: Substring match
            const index = itemNameLower.indexOf(searchTerm);
            substringMatches.push({ 
                item, 
                name: itemName, 
                index: index,
                startsWord: index === 0 || itemNameLower[index - 1] === ' '
            });
        } else {
            // Priority 4: Fuzzy match (only if very close)
            let minDistance = Infinity;
            
            // Check each word
            for (const word of itemWords) {
                const distance = levenshteinDistance(searchTerm, word);
                minDistance = Math.min(minDistance, distance);
            }
            
            // Only include if very close match (max 1 character different)
            if (minDistance === 1) {
                fuzzyMatches.push({ item, name: itemName, distance: minDistance });
            } else {
                item.style.display = 'none';
            }
        }
    });

    // Hide all items first
    items.forEach(item => item.style.display = 'none');

    // Sort substring matches (words that start with search term come first)
    substringMatches.sort((a, b) => {
        if (a.startsWord !== b.startsWord) return b.startsWord ? 1 : -1;
        return a.index - b.index;
    });

    // Combine all results in priority order (NO alphabetical sorting)
    const allResults = [
        ...exactFullMatches,
        ...exactWordMatches,
        ...substringMatches,
        ...fuzzyMatches
    ];

    // Get the parent container
    const container = document.getElementById('AllItems');
    
    // Display results in order by moving them to the end of the container
    allResults.forEach((result, index) => {
        result.item.style.display = 'block';
        // Move the item to the end of the container to maintain our custom order
        container.appendChild(result.item);
    });

    // Debug logging
    console.log(`Search for "${searchTerm}":`);
    console.log(`- Exact full matches: ${exactFullMatches.length}`, exactFullMatches.map(m => m.name));
    console.log(`- Exact word matches: ${exactWordMatches.length}`, exactWordMatches.slice(0, 5).map(m => m.name));
    console.log(`- Substring matches: ${substringMatches.length}`, substringMatches.slice(0, 5).map(m => m.name));
    console.log(`- Fuzzy matches: ${fuzzyMatches.length}`, fuzzyMatches.map(m => m.name));
}

// Helper function for fuzzy matching
function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1, // deletion
                matrix[j - 1][i] + 1, // insertion
                matrix[j - 1][i - 1] + substitutionCost // substitution
            );
        }
    }
    
    return matrix[str2.length][str1.length];
}

function capitalizeWords(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function setActiveCategory(category, isActive) {
    const categoryButton = [...document.getElementsByClassName('category-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === category.toLowerCase()
    );
    if (isActive) {
        activeCategories.add(category.toLowerCase());
        categoryButton.classList.add('active');
    } else {
        activeCategories.delete(category.toLowerCase());
        categoryButton.classList.remove('active');
    }

    const categoriesButton = document.getElementById('categoriesButton');
    if (activeCategories.size === 0) {
        categoriesButton.textContent = 'Category';
    } else {
        categoriesButton.textContent = `Category: ${[...activeCategories].map(c => capitalizeWords(c)).join(', ')}`;
    }

    filterItems();
}

function setActiveCollection(collection, isActive) {
    const collectionButton = [...document.getElementsByClassName('collection-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === collection.toLowerCase()
    );
    if (isActive) {
        activeCollections.add(collection.toLowerCase());
        collectionButton.classList.add('active');
    } else {
        activeCollections.delete(collection.toLowerCase());
        collectionButton.classList.remove('active');
    }

    const collectionsButton = document.getElementById('collectionsButton');
    if (activeCollections.size === 0) {
        collectionsButton.textContent = 'Collections';
    } else {
        collectionsButton.textContent = `Collections: ${[...activeCollections].map(c => capitalizeWords(c)).join(', ')}`;
    }

    filterItems();
}

function setActiveColor(color, isActive) {
    const colorButton = [...document.getElementsByClassName('color-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === color.toLowerCase()
    );
    if (isActive) {
        activeColors.add(color.toLowerCase());
        colorButton.classList.add('active');
    } else {
        activeColors.delete(color.toLowerCase());
        colorButton.classList.remove('active');
    }

    const colorButtonHeader = document.getElementById('colorsButton');
    if (activeColors.size === 0) {
        colorButtonHeader.textContent = 'Colors';
    } else {
        colorButtonHeader.textContent = `Colors: ${[...activeColors].map(c => capitalizeWords(c)).join(', ')}`;
    }

    filterItems();
}

function setActiveFootprint(footprint, isActive) {
    const footprintButton = [...document.getElementsByClassName('footprint-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === footprint.toLowerCase()
    );
    const checkboxIcon = footprintButton.querySelector('.checkbox-icon');
    if (isActive) {
        activeFootprints.add(footprint.toLowerCase());
        footprintButton.classList.add('active');
        checkboxIcon.src = 'assets/icons/items/footprint/checkbox_on.png';
    } else {
        activeFootprints.delete(footprint.toLowerCase());
        footprintButton.classList.remove('active');
        checkboxIcon.src = 'assets/icons/items/footprint/checkbox_off.png';
    }

    const footprintButtonHeader = document.getElementById('footprintButton');
    if (activeFootprints.size === 0) {
        footprintButtonHeader.textContent = 'Footprint';
    } else {
        footprintButtonHeader.textContent = `Footprint: ${[...activeFootprints].join(', ')}`;
    }

    filterItems();
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);

    const views = JSON.parse(event.target.dataset.views);
    let currentViewIndex = event.target.dataset.currentViewIndex ? parseInt(event.target.dataset.currentViewIndex) : 0;
    const dragImage = document.createElement('img');
    dragImage.src = views[currentViewIndex];
    dragImage.style.opacity = '0.75'; // Set the opacity to a uniform lower value
    dragImage.style.position = 'absolute';
    dragImage.style.left = '-99999px';
    document.body.appendChild(dragImage);
    event.dataTransfer.setDragImage(dragImage, event.offsetX, event.offsetY);

    offsetX = event.offsetX;
    offsetY = event.offsetY;

    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const dropZone = document.getElementById('dropZone');

    if (!draggedElement) return;

    const dropRect = dropZone.getBoundingClientRect();
    const x = event.clientX - dropRect.left - offsetX;
    const y = event.clientY - dropRect.top - offsetY;

    if (event.shiftKey) {
        const clonedElement = createClonedElement(draggedElement, x, y);
        dropZone.appendChild(clonedElement);
    } else if (draggedElement.dataset.source === 'catalog') {
        const views = JSON.parse(draggedElement.dataset.views);
        const clonedElement = document.createElement('img');
        clonedElement.src = views[0]; // Use the first view
        clonedElement.alt = draggedElement.alt;
        clonedElement.style.position = 'absolute';
        clonedElement.style.left = `${x}px`;
        clonedElement.style.top = `${y}px`;
        clonedElement.setAttribute('tabindex', '0');
        clonedElement.id = `cloned-${data}-${Date.now()}`;
        clonedElement.dataset.views = JSON.stringify(views);
        clonedElement.dataset.currentViewIndex = "0";
        clonedElement.dataset.source = 'dropZone';

        clonedElement.style.zIndex = ++highestZIndex;
        clonedElement.draggable = true;

        clonedElement.addEventListener('dragstart', drag);
        clonedElement.addEventListener('keydown', function(event) {
            handleArrowKeys(event, clonedElement);
        });
        clonedElement.addEventListener('click', function() {
            bringToFront(clonedElement);
        });
        clonedElement.addEventListener('dblclick', function() {
            changeView(clonedElement);
        });

        dropZone.appendChild(clonedElement);
    } else {
        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;

        draggedElement.style.zIndex = ++highestZIndex;
    }
}

function createClonedElement(draggedElement, x, y) {
    const views = JSON.parse(draggedElement.dataset.views);
    const currentViewIndex = parseInt(draggedElement.dataset.currentViewIndex);
    const clonedElement = document.createElement('img');
    clonedElement.src = views[currentViewIndex];
    clonedElement.alt = draggedElement.alt;
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = `${x}px`;
    clonedElement.style.top = `${y}px`;
    clonedElement.setAttribute('tabindex', '0');
    clonedElement.id = `cloned-${draggedElement.id}-${Date.now()}`;
    clonedElement.dataset.views = JSON.stringify(views);
    clonedElement.dataset.currentViewIndex = currentViewIndex.toString();

    clonedElement.style.zIndex = ++highestZIndex;
    clonedElement.draggable = true;
    clonedElement.dataset.source = 'dropZone';

    clonedElement.addEventListener('dragstart', drag);
    clonedElement.addEventListener('keydown', function(event) {
        handleArrowKeys(event, clonedElement);
    });
    clonedElement.addEventListener('click', function() {
        bringToFront(clonedElement);
    });
    clonedElement.addEventListener('dblclick', function() {
        changeView(clonedElement);
    });

    return clonedElement;
}

function handleArrowKeys(event, element) {
    const step = 5;
    event.preventDefault();
    switch(event.key) {
        case 'ArrowLeft':
            element.style.left = `${parseInt(element.style.left) - step}px`;
            break;
        case 'ArrowRight':
            element.style.left = `${parseInt(element.style.left) + step}px`;
            break;
        case 'ArrowUp':
            element.style.top = `${parseInt(element.style.top) - step}px`;
            break;
        case 'ArrowDown':
            element.style.top = `${parseInt(element.style.top) + step}px`;
            break;
        case 'Backspace':
            element.remove();
            event.preventDefault();
            break;
    }
}

function bringToFront(element) {
    element.style.zIndex = ++highestZIndex;
}

function changeView(element) {
    const views = JSON.parse(element.dataset.views);
    let currentViewIndex = parseInt(element.dataset.currentViewIndex);
    currentViewIndex = (currentViewIndex + 1) % views.length;
    element.src = views[currentViewIndex];
    element.dataset.currentViewIndex = currentViewIndex;
}

function setBackground(item) {
    const dropZone = document.getElementById('dropZone');
    const category = item.dataset.category ? item.dataset.category.toLowerCase() : null;
    let imgElement;

    if (category === 'wallpaper') {
        imgElement = document.getElementById('wallpaper');
        if (currentWallpaper) {
            currentWallpaper.src = '';
        }
    } else if (category === 'flooring') {
        imgElement = document.getElementById('flooring');
        if (currentFlooring) {
            currentFlooring.src = '';
        }
    } else {
        imgElement = document.getElementById('background');
        if (currentBackground) {
            currentBackground.src = '';
        }
    }

    if (!imgElement) return;

    imgElement.src = item.dataset.dropImage;
    imgElement.style.left = item.dataset.fixedLocationLeft || '0px';
    imgElement.style.top = item.dataset.fixedLocationTop || '0px';

    if (category === 'wallpaper') {
        currentWallpaper = imgElement;
    } else if (category === 'flooring') {
        currentFlooring = imgElement;
    } else {
        currentBackground = imgElement;
    }
}

function loadWallpaperFlooring() {
    fetch('wallfloor.json')
        .then(response => response.json())
        .then(data => {
            const allTab = document.getElementById('AllWallpaperFlooring');
            if (!allTab) {
                console.error('AllWallpaperFlooring element not found');
                return;
            }
            allTab.innerHTML = ''; // Clear the container

            data.forEach(item => {
                const itemContainer = document.createElement('div');
                
                // Ensure item.collection is always an array
                const collections = Array.isArray(item.collection) ? item.collection : [item.collection];

                itemContainer.dataset.collection = JSON.stringify(collections.map(col => col.toLowerCase()));
                itemContainer.dataset.colors = JSON.stringify(item.colors ? item.colors.map(color => color.toLowerCase()) : []);

                collections.forEach(col => collectionsWallpaperFlooring.add(col.toLowerCase()));
                (item.colors || []).forEach(color => colorsWallpaperFlooring.add(color.toLowerCase()));
                categoriesWallpaperFlooring.add(item.category.toLowerCase());

                const img = document.createElement('img');
                img.id = item.name;
                img.src = 'images/wallfloor/' + item.catalogImage;
                img.alt = item.name;
                img.dataset.dropImage = 'images/wallfloor/' + item.views[2]; // Use the "large" view
                img.dataset.fixedLocationLeft = item.fixedLocationLeft;
                img.dataset.fixedLocationTop = item.fixedLocationTop;
                img.dataset.source = 'catalog';
                img.dataset.category = item.category;
                img.onclick = () => setBackground(img);

                const label = document.createElement('div'); 
                label.classList.add('item-label');
                label.textContent = item.name;
                itemContainer.appendChild(img);
                itemContainer.appendChild(label);


                allTab.appendChild(itemContainer);
            });

            loadCollectionsWallpaperFlooring([...collectionsWallpaperFlooring]);
            loadColorsWallpaperFlooring([...colorsWallpaperFlooring]);
            loadCategoriesWallpaperFlooring([...categoriesWallpaperFlooring]);

            filterItemsWallpaperFlooring(); // Initialize the filter on load
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function loadCategoriesWallpaperFlooring(categories) {
    const categoryButtonsContainer = document.getElementById('categoriesDropdownWallpaperFlooring');
    categoryButtonsContainer.innerHTML = '';

    const sortedCategories = Array.from(categories).sort();

    sortedCategories.forEach(category => {
        if (category.trim() === '') return;
        const icon = `assets/icons/wallpaper&flooring/category/${category.toLowerCase()}.png`;
        const capitalizedCategory = capitalizeWords(category);
        const button = document.createElement('div'); // Use div instead of label
        button.className = 'category-button';
        button.innerHTML = `<img src="${icon}" alt="${capitalizedCategory} Icon" class="filter-icon"><span>${capitalizedCategory}</span>`;
        button.onclick = () => {
            const isActive = !button.classList.contains('active');
            setActiveCategoryWallpaperFlooring(category, isActive);
        };
        categoryButtonsContainer.appendChild(button);
    });
}

function loadCollectionsWallpaperFlooring(collections) {
    const collectionButtonsContainer = document.getElementById('collectionsDropdownWallpaperFlooring');
    collectionButtonsContainer.innerHTML = '';

    const order = ["Default", "Solid", "Pattern", "Wooden", "Tiled", "Floral", "Garden", "Nature", "Water", "Winter", "Spring", "Summer", "Fall", "Valentine", "Halloween", "Christmas"];
    const collectionsArray = Array.from(collections);

    order.forEach(collection => {
        if (collectionsArray.includes(collection.toLowerCase())) {
            const icon = `assets/icons/wallpaper&flooring/collections/${collection.toLowerCase()}.png`;
            const capitalizedCollection = capitalizeWords(collection);
            const button = document.createElement('div'); // Use div instead of label
            button.className = 'collection-button';
            button.innerHTML = `<img src="${icon}" alt="${capitalizedCollection} Icon" class="filter-icon"><span>${capitalizedCollection}</span>`;
            button.onclick = () => {
                const isActive = !button.classList.contains('active');
                setActiveCollectionWallpaperFlooring(collection, isActive);
            };
            collectionButtonsContainer.appendChild(button);
        }
    });
}

function loadColorsWallpaperFlooring(colors) {
    const colorButtonsContainer = document.getElementById('colorsDropdownWallpaperFlooring');
    colorButtonsContainer.innerHTML = '';

    const order = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "Brown", "Gray", "Black", "White", "Gold", "Rainbow"];
    const colorsArray = Array.from(colors);

    order.forEach(color => {
        if (colorsArray.includes(color.toLowerCase())) {
            const icon = `assets/icons/wallpaper&flooring/colors/${color.toLowerCase()}.png`;
            const capitalizedColor = capitalizeWords(color);
            const button = document.createElement('div'); // Use div instead of label
            button.className = 'color-button';
            button.innerHTML = `<img src="${icon}" alt="${capitalizedColor} Icon" class="filter-icon"><span>${capitalizedColor}</span>`;
            button.onclick = () => {
                const isActive = !button.classList.contains('active');
                setActiveColorWallpaperFlooring(color, isActive);
            };
            colorButtonsContainer.appendChild(button);
        }
    });
}
function setActiveCategoryWallpaperFlooring(category, isActive) {
    const categoryButton = [...document.getElementsByClassName('category-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === category.toLowerCase()
    );
    if (!categoryButton) {
        console.error(`Category button for "${category}" not found`);
        return;
    }

    if (isActive) {
        activeCategoriesWallpaperFlooring.add(category.toLowerCase());
        categoryButton.classList.add('active');
    } else {
        activeCategoriesWallpaperFlooring.delete(category.toLowerCase());
        categoryButton.classList.remove('active');
    }

    const categoriesButton = document.getElementById('categoriesButtonWallpaperFlooring');
    if (activeCategoriesWallpaperFlooring.size === 0) {
        categoriesButton.textContent = 'Category';
    } else {
        categoriesButton.textContent = `Category: ${[...activeCategoriesWallpaperFlooring].map(c => capitalizeWords(c)).join(', ')}`;
    }

    filterItemsWallpaperFlooring();
}

function setActiveCollectionWallpaperFlooring(collection, isActive) {
    const collectionButton = [...document.getElementsByClassName('collection-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === collection.toLowerCase()
    );
    if (!collectionButton) {
        console.error(`Collection button for "${collection}" not found`);
        return;
    }

    if (isActive) {
        activeCollectionsWallpaperFlooring.add(collection.toLowerCase());
        collectionButton.classList.add('active');
    } else {
        activeCollectionsWallpaperFlooring.delete(collection.toLowerCase());
        collectionButton.classList.remove('active');
    }

    const collectionsButton = document.getElementById('collectionsButtonWallpaperFlooring');
    if (activeCollectionsWallpaperFlooring.size === 0) {
        collectionsButton.textContent = 'Collections';
    } else {
        collectionsButton.textContent = `Collections: ${[...activeCollectionsWallpaperFlooring].map(c => capitalizeWords(c)).join(', ')}`;
    }

    filterItemsWallpaperFlooring();
}

function setActiveColorWallpaperFlooring(color, isActive) {
    const colorButton = [...document.querySelectorAll('#colorsDropdownWallpaperFlooring .color-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === color.toLowerCase()
    );
    if (!colorButton) {
        console.error(`Color button for "${color}" not found`);
        return;
    }

    if (isActive) {
        activeColorsWallpaperFlooring.add(color.toLowerCase());
        colorButton.classList.add('active');
    } else {
        activeColorsWallpaperFlooring.delete(color.toLowerCase());
        colorButton.classList.remove('active');
    }

    const colorsButton = document.getElementById('colorsButtonWallpaperFlooring');
    if (activeColorsWallpaperFlooring.size === 0) {
        colorsButton.textContent = 'Colors';
    } else {
        colorsButton.textContent = `Colors: ${[...activeColorsWallpaperFlooring].map(c => capitalizeWords(c)).join(', ')}`;
    }

    filterItemsWallpaperFlooring();
}

function resetAllFiltersWallpaperFlooring() {
    activeCollectionsWallpaperFlooring.clear();
    activeColorsWallpaperFlooring.clear();
    activeCategoriesWallpaperFlooring.clear();
    document.getElementById('collectionsButtonWallpaperFlooring').textContent = 'Collections';
    document.getElementById('colorsButtonWallpaperFlooring').textContent = 'Colors';
    document.getElementById('categoriesButtonWallpaperFlooring').textContent = 'Category';

    // Remove the highlight from filter options
    const buttons = document.querySelectorAll('#filterContainerWallpaperFlooring .collection-button, #filterContainerWallpaperFlooring .color-button, #filterContainerWallpaperFlooring .category-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Close all dropdowns
    const dropdowns = document.querySelectorAll('#filterContainerWallpaperFlooring .dropdown-content');
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'));

    filterItemsWallpaperFlooring(); // Reapply filter
}

function filterItemsWallpaperFlooring() {
    const items = document.querySelectorAll('#AllWallpaperFlooring .catalog-item');
    items.forEach(item => {
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors) : [];
        const itemCollections = item.dataset.collection ? JSON.parse(item.dataset.collection) : [];
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';

        const matchesCollection = activeCollectionsWallpaperFlooring.size === 0 || itemCollections.some(collection => activeCollectionsWallpaperFlooring.has(collection.toLowerCase()));
        const matchesColor = activeColorsWallpaperFlooring.size === 0 || itemColors.some(color => activeColorsWallpaperFlooring.has(color.toLowerCase()));
        const matchesCategory = activeCategoriesWallpaperFlooring.size === 0 || activeCategoriesWallpaperFlooring.has(itemCategory);

        if (matchesCollection && matchesColor && matchesCategory) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function searchItemsWallpaperFlooring() {
    const searchTerm = document.getElementById('searchInputWallpaperFlooring').value.toLowerCase().trim();
    const items = Array.from(document.querySelectorAll('#AllWallpaperFlooring .catalog-item'));
    
    // If search is empty, just apply filters without search
    if (!searchTerm) {
        items.forEach(item => {
            // Get item properties for filtering
            const itemCollections = item.dataset.collection ? JSON.parse(item.dataset.collection).map(col => col.toLowerCase()) : [];
            const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];
            const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';

            // Check active filters
            const matchesCollection = activeCollectionsWallpaperFlooring.size === 0 || 
                itemCollections.some(collection => activeCollectionsWallpaperFlooring.has(collection));
            const matchesColor = activeColorsWallpaperFlooring.size === 0 || 
                itemColors.some(color => activeColorsWallpaperFlooring.has(color));
            const matchesCategory = activeCategoriesWallpaperFlooring.size === 0 || 
                activeCategoriesWallpaperFlooring.has(itemCategory);

            // Show/hide based on filters only
            item.style.display = (matchesCollection && matchesColor && matchesCategory) ? 'block' : 'none';
        });
        return;
    }

    // Arrays to categorize matches
    const exactFullMatches = [];
    const exactWordMatches = [];
    const substringMatches = [];
    const fuzzyMatches = [];

    items.forEach(item => {
        // Get item name
        const itemName = item.querySelector('p')?.textContent?.trim() || '';
        const itemNameLower = itemName.toLowerCase();
        const itemWords = itemNameLower.split(/\s+/);
        
        // Get item properties for filtering
        const itemCollections = item.dataset.collection ? JSON.parse(item.dataset.collection).map(col => col.toLowerCase()) : [];
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';

        // Check active filters
        const matchesCollection = activeCollectionsWallpaperFlooring.size === 0 || 
            itemCollections.some(collection => activeCollectionsWallpaperFlooring.has(collection));
        const matchesColor = activeColorsWallpaperFlooring.size === 0 || 
            itemColors.some(color => activeColorsWallpaperFlooring.has(color));
        const matchesCategory = activeCategoriesWallpaperFlooring.size === 0 || 
            activeCategoriesWallpaperFlooring.has(itemCategory);

        // Skip if doesn't match filters
        if (!matchesCollection || !matchesColor || !matchesCategory) {
            item.style.display = 'none';
            return;
        }

        // Check match type
        if (itemNameLower === searchTerm) {
            // Priority 1: Exact full name match
            exactFullMatches.push({ item, name: itemName });
        } else if (itemWords.includes(searchTerm)) {
            // Priority 2: Exact word match
            exactWordMatches.push({ item, name: itemName });
        } else if (itemNameLower.includes(searchTerm)) {
            // Priority 3: Substring match
            const index = itemNameLower.indexOf(searchTerm);
            substringMatches.push({ 
                item, 
                name: itemName, 
                index: index,
                startsWord: index === 0 || itemNameLower[index - 1] === ' '
            });
        } else {
            // Priority 4: Fuzzy match (only if very close)
            let minDistance = Infinity;
            
            // Check each word
            for (const word of itemWords) {
                const distance = levenshteinDistance(searchTerm, word);
                minDistance = Math.min(minDistance, distance);
            }
            
            // Only include if very close match (max 1 character different)
            if (minDistance === 1) {
                fuzzyMatches.push({ item, name: itemName, distance: minDistance });
            } else {
                item.style.display = 'none';
            }
        }
    });

    // Hide all items first
    items.forEach(item => item.style.display = 'none');

    // Sort substring matches (words that start with search term come first)
    substringMatches.sort((a, b) => {
        if (a.startsWord !== b.startsWord) return b.startsWord ? 1 : -1;
        return a.index - b.index;
    });

    // Combine all results in priority order (NO alphabetical sorting)
    const allResults = [
        ...exactFullMatches,
        ...exactWordMatches,
        ...substringMatches,
        ...fuzzyMatches
    ];

    // Get the parent container
    const container = document.getElementById('AllWallpaperFlooring');
    
    // Display results in order by moving them to the end of the container
    allResults.forEach((result, index) => {
        result.item.style.display = 'block';
        // Move the item to the end of the container to maintain our custom order
        container.appendChild(result.item);
    });

    // Debug logging
    console.log(`Wallpaper/Flooring search for "${searchTerm}":`);
    console.log(`- Exact full matches: ${exactFullMatches.length}`, exactFullMatches.map(m => m.name));
    console.log(`- Exact word matches: ${exactWordMatches.length}`, exactWordMatches.slice(0, 5).map(m => m.name));
    console.log(`- Substring matches: ${substringMatches.length}`, substringMatches.slice(0, 5).map(m => m.name));
    console.log(`- Fuzzy matches: ${fuzzyMatches.length}`, fuzzyMatches.map(m => m.name));
}

function loadBackgrounds() {
    fetch('backgrounds.json')
        .then(response => response.json())
        .then(data => {
            const allTab = document.getElementById('AllBackgrounds');
            if (!allTab) {
                console.error('AllBackgrounds element not found');
                return;
            }
            allTab.innerHTML = ''; // Clear the container

            collectionsBackgrounds.clear();
            colorsBackgrounds.clear();

            data.forEach(item => {
                const itemContainer = document.createElement('div');
                

                // Store collections and colors as data attributes
                const collections = Array.isArray(item.collection) ? item.collection : [item.collection];
                itemContainer.dataset.collection = JSON.stringify(collections.map(col => col.toLowerCase()));
                itemContainer.dataset.colors = JSON.stringify(item.colors ? item.colors.map(color => color.toLowerCase()) : []);

                // Add to global sets for filter buttons
                collections.forEach(col => collectionsBackgrounds.add(col.toLowerCase()));
                (item.colors || []).forEach(color => colorsBackgrounds.add(color.toLowerCase()));

                const img = document.createElement('img');
                img.id = item.name;
                img.src = 'images/backgrounds/' + item.catalogImage;
                img.alt = item.name;
                img.dataset.dropImage = 'images/backgrounds/' + item.dropImage;
                img.onclick = () => setBackground(img);

                const label = document.createElement('div'); 
                label.classList.add('item-label');
                label.textContent = item.name;
                itemContainer.appendChild(img);
                itemContainer.appendChild(label);

                allTab.appendChild(itemContainer);
            });

            // Load the filter buttons
            loadCollectionsBackgrounds([...collectionsBackgrounds]);
            loadColorsBackgrounds([...colorsBackgrounds]);

            // Apply initial filters
            filterItemsBackgrounds();
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function loadCollectionsBackgrounds(collections) {
    const collectionButtonsContainer = document.getElementById('collectionsDropdownBackgrounds');
    collectionButtonsContainer.innerHTML = '';

    const order = ["Default", "Pattern", "Nature", "Fall"];
    const collectionsArray = Array.from(collections);

    order.forEach(collection => {
        if (collectionsArray.includes(collection.toLowerCase())) {
            const icon = `assets/icons/backgrounds/collections/${collection.toLowerCase()}.png`;
            const capitalizedCollection = capitalizeWords(collection);
            const button = document.createElement('div');
            button.className = 'collection-button';
            button.innerHTML = `<img src="${icon}" alt="${capitalizedCollection} Icon" class="filter-icon"><span>${capitalizedCollection}</span>`;
            button.onclick = () => {
                const isActive = !button.classList.contains('active');
                setActiveCollectionBackgrounds(collection, isActive);
            };
            collectionButtonsContainer.appendChild(button);
        }
    });
}

function loadColorsBackgrounds(colors) {
    const colorButtonsContainer = document.getElementById('colorsDropdownBackgrounds');
    colorButtonsContainer.innerHTML = '';

    const order = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "Brown", "Gray", "Black", "White", "Gold", "Rainbow"];
    const colorsArray = Array.from(colors);

    order.forEach(color => {
        if (colorsArray.includes(color.toLowerCase())) {
            const capitalizedColor = capitalizeWords(color);
            const button = document.createElement('div');
            button.className = 'color-button';
            button.innerHTML = `
                <div class="color-icon" style="background-image: url('assets/icons/backgrounds/colors/${color.toLowerCase()}.png');"></div>
                <span>${capitalizedColor}</span>
            `;
            button.onclick = () => {
                const isActive = !button.classList.contains('active');
                setActiveColorBackgrounds(color, isActive);
            };
            colorButtonsContainer.appendChild(button);
        }
    });
}

function setActiveCollectionBackgrounds(collection, isActive) {
    const collectionButton = [...document.querySelectorAll('#collectionsDropdownBackgrounds .collection-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === collection.toLowerCase()
    );
    if (!collectionButton) {
        console.error(`Collection button for "${collection}" not found`);
        return;
    }

    if (isActive) {
        activeCollectionsBackgrounds.add(collection.toLowerCase());
        collectionButton.classList.add('active');
    } else {
        activeCollectionsBackgrounds.delete(collection.toLowerCase());
        collectionButton.classList.remove('active');
    }

    const collectionsButton = document.getElementById('collectionsButtonBackgrounds');
    if (activeCollectionsBackgrounds.size === 0) {
        collectionsButton.textContent = 'Collections';
    } else {
        collectionsButton.textContent = `Collections: ${[...activeCollectionsBackgrounds].map(c => capitalizeWords(c)).join(', ')}`;
    }

    filterItemsBackgrounds();
}

function setActiveColorBackgrounds(color, isActive) {
    const colorButton = [...document.querySelectorAll('#colorsDropdownBackgrounds .color-button')].find(button =>
        button.querySelector('span').textContent.trim().toLowerCase() === color.toLowerCase()
    );
    if (!colorButton) {
        console.error(`Color button for "${color}" not found`);
        return;
    }

    if (isActive) {
        activeColorsBackgrounds.add(color.toLowerCase());
        colorButton.classList.add('active');
    } else {
        activeColorsBackgrounds.delete(color.toLowerCase());
        colorButton.classList.remove('active');
    }

    const colorsButton = document.getElementById('colorsButtonBackgrounds');
    if (activeColorsBackgrounds.size === 0) {
        colorsButton.textContent = 'Colors';
    } else {
        colorsButton.textContent = `Colors: ${[...activeColorsBackgrounds].map(c => capitalizeWords(c)).join(', ')}`;
    }

    filterItemsBackgrounds();
}

function filterItemsBackgrounds() {
    const items = document.querySelectorAll('#AllBackgrounds .catalog-item');
    items.forEach(item => {
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors) : [];
        const itemCollections = item.dataset.collection ? JSON.parse(item.dataset.collection) : [];

        const matchesCollection = activeCollectionsBackgrounds.size === 0 || 
            itemCollections.some(collection => activeCollectionsBackgrounds.has(collection.toLowerCase()));
        const matchesColor = activeColorsBackgrounds.size === 0 || 
            itemColors.some(color => activeColorsBackgrounds.has(color.toLowerCase()));

        if (matchesCollection && matchesColor) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function resetAllFiltersBackgrounds() {
    activeCollectionsBackgrounds.clear();
    activeColorsBackgrounds.clear();
    document.getElementById('collectionsButtonBackgrounds').textContent = 'Collections';
    document.getElementById('colorsButtonBackgrounds').textContent = 'Colors';

    // Remove the highlight from filter options
    const buttons = document.querySelectorAll('#filterContainerBackgrounds .collection-button, #filterContainerBackgrounds .color-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Close all dropdowns
    const dropdowns = document.querySelectorAll('#filterContainerBackgrounds .dropdown-content');
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'));

    filterItemsBackgrounds(); // Reapply filter
}

function searchItemsBackgrounds() {
    const searchTerm = document.getElementById('searchInputBackgrounds').value.toLowerCase().trim();
    const items = Array.from(document.querySelectorAll('#AllBackgrounds .catalog-item'));
    
    // If search is empty, just apply filters without search
    if (!searchTerm) {
        items.forEach(item => {
            // Get item properties for filtering
            const itemCollections = item.dataset.collection ? JSON.parse(item.dataset.collection).map(col => col.toLowerCase()) : [];
            const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];

            // Check active filters
            const matchesCollection = activeCollectionsBackgrounds.size === 0 || 
                itemCollections.some(collection => activeCollectionsBackgrounds.has(collection));
            const matchesColor = activeColorsBackgrounds.size === 0 || 
                itemColors.some(color => activeColorsBackgrounds.has(color));

            // Show/hide based on filters only
            item.style.display = (matchesCollection && matchesColor) ? 'block' : 'none';
        });
        return;
    }

    // Arrays to categorize matches
    const exactFullMatches = [];
    const exactWordMatches = [];
    const substringMatches = [];
    const fuzzyMatches = [];

    items.forEach(item => {
        // Get item name
        const itemName = item.querySelector('p')?.textContent?.trim() || '';
        const itemNameLower = itemName.toLowerCase();
        const itemWords = itemNameLower.split(/\s+/);
        
        // Get item properties for filtering
        const itemCollections = item.dataset.collection ? JSON.parse(item.dataset.collection).map(col => col.toLowerCase()) : [];
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];

        // Check active filters
        const matchesCollection = activeCollectionsBackgrounds.size === 0 || 
            itemCollections.some(collection => activeCollectionsBackgrounds.has(collection));
        const matchesColor = activeColorsBackgrounds.size === 0 || 
            itemColors.some(color => activeColorsBackgrounds.has(color));

        // Skip if doesn't match filters
        if (!matchesCollection || !matchesColor) {
            item.style.display = 'none';
            return;
        }

        // Check match type
        if (itemNameLower === searchTerm) {
            // Priority 1: Exact full name match
            exactFullMatches.push({ item, name: itemName });
        } else if (itemWords.includes(searchTerm)) {
            // Priority 2: Exact word match
            exactWordMatches.push({ item, name: itemName });
        } else if (itemNameLower.includes(searchTerm)) {
            // Priority 3: Substring match
            const index = itemNameLower.indexOf(searchTerm);
            substringMatches.push({ 
                item, 
                name: itemName, 
                index: index,
                startsWord: index === 0 || itemNameLower[index - 1] === ' '
            });
        } else {
            // Priority 4: Fuzzy match (only if very close)
            let minDistance = Infinity;
            
            // Check each word
            for (const word of itemWords) {
                const distance = levenshteinDistance(searchTerm, word);
                minDistance = Math.min(minDistance, distance);
            }
            
            // Only include if very close match (max 1 character different)
            if (minDistance === 1) {
                fuzzyMatches.push({ item, name: itemName, distance: minDistance });
            } else {
                item.style.display = 'none';
            }
        }
    });

    // Hide all items first
    items.forEach(item => item.style.display = 'none');

    // Sort substring matches (words that start with search term come first)
    substringMatches.sort((a, b) => {
        if (a.startsWord !== b.startsWord) return b.startsWord ? 1 : -1;
        return a.index - b.index;
    });

    // Combine all results in priority order (NO alphabetical sorting)
    const allResults = [
        ...exactFullMatches,
        ...exactWordMatches,
        ...substringMatches,
        ...fuzzyMatches
    ];

    // Get the parent container
    const container = document.getElementById('AllBackgrounds');
    
    // Display results in order by moving them to the end of the container
    allResults.forEach((result, index) => {
        result.item.style.display = 'block';
        // Move the item to the end of the container to maintain our custom order
        container.appendChild(result.item);
    });

    // Debug logging
    console.log(`Backgrounds search for "${searchTerm}":`);
    console.log(`- Exact full matches: ${exactFullMatches.length}`, exactFullMatches.map(m => m.name));
    console.log(`- Exact word matches: ${exactWordMatches.length}`, exactWordMatches.slice(0, 5).map(m => m.name));
    console.log(`- Substring matches: ${substringMatches.length}`, substringMatches.slice(0, 5).map(m => m.name));
    console.log(`- Fuzzy matches: ${fuzzyMatches.length}`, fuzzyMatches.map(m => m.name));
}

function openPopup(item) {
    const popup = document.getElementById('itemPopup');
    const catalogImage = document.getElementById('popupCatalogImage');
    const itemName = document.getElementById('popupItemName');
    const category = document.getElementById('popupCategory');
    const collection = document.getElementById('popupCollection');
    const colors = document.getElementById('popupColors');
    const footprint = document.getElementById('popupFootprint');
    const preview = document.getElementById('popupPreview');
    const viewsHeader = document.getElementById('popupViewsHeader');
    const viewsContainer = document.getElementById('popupViewsContainer');

    catalogImage.src = item.src;
    itemName.textContent = `Name: ${item.alt}`;
    category.textContent = `Category: ${item.dataset.category}`;

    let collectionsArray = item.dataset.collection ? JSON.parse(item.dataset.collection) : [];
    collection.textContent = `Collection: ${collectionsArray.join(', ')}`;

    let colorsArray = item.dataset.colors ? JSON.parse(item.dataset.colors) : [];
    colors.textContent = `Colors: ${colorsArray.join(', ')}`;

    footprint.textContent = `Footprint: ${item.dataset.footprint}`;

    let viewsArray = item.dataset.views ? JSON.parse(item.dataset.views) : [];

    // Clear previous preview and set the new preview image
    preview.innerHTML = '';
    if (viewsArray.length > 0) {
        const previewImg = document.createElement('img');
        previewImg.src = viewsArray[0];
        preview.appendChild(previewImg);

        // Adjust preview image size and center it within the 400px box
        previewImg.onload = () => {
            const widthRatio = previewImg.naturalWidth / 400;
            const heightRatio = previewImg.naturalHeight / 400;
            const maxRatio = Math.max(widthRatio, heightRatio);

            if (maxRatio > 1) {
                if (previewImg.naturalWidth > previewImg.naturalHeight) {
                    previewImg.style.width = '400px';
                    previewImg.style.height = 'auto';
                } else {
                    previewImg.style.height = '400px';
                    previewImg.style.width = 'auto';
                }
            } else {
                previewImg.style.width = `${previewImg.naturalWidth}px`;
                previewImg.style.height = `${previewImg.naturalHeight}px`;
            }

            preview.style.display = 'flex';
            preview.style.alignItems = 'center';
            preview.style.justifyContent = 'center';
        };
    }

    viewsHeader.textContent = 'Views:';
    viewsContainer.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const viewContainer = document.createElement('div');
        if (i < viewsArray.length) {
            const viewImg = document.createElement('img');
            viewImg.src = viewsArray[i];
            viewImg.onload = () => {
                const widthRatio = viewImg.naturalWidth / 100;
                const heightRatio = viewImg.naturalHeight / 100;
                const maxRatio = Math.max(widthRatio, heightRatio);

                if (maxRatio > 1) {
                    if (viewImg.naturalWidth > viewImg.naturalHeight) {
                        viewImg.style.width = '100px';
                        viewImg.style.height = 'auto';
                    } else {
                        viewImg.style.height = '100px';
                        viewImg.style.width = 'auto';
                    }
                } else {
                    viewImg.style.width = `${viewImg.naturalWidth}px`;
                    viewImg.style.height = `${viewImg.naturalHeight}px`;
                }
            };
            viewImg.onclick = () => {
                preview.querySelector('img').src = viewsArray[i];
            };
            viewContainer.appendChild(viewImg);
        }
        viewsContainer.appendChild(viewContainer);
    }

    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('itemPopup').style.display = 'none';
}

let autoZAxisEnabled = false;

// Listen for toggle switch changes
document.addEventListener("DOMContentLoaded", function() {
    const autoZAxisToggle = document.getElementById("autoZAxisToggle");
    
    autoZAxisToggle.addEventListener("change", function() {
        autoZAxisEnabled = this.checked;
        updateItemZIndex(); // Recalculate z-index when toggled
    });
});

// Function to update item z-index based on their position
function updateItemZIndex() {
    if (!autoZAxisEnabled) return;

    let items = Array.from(document.querySelectorAll(".placed-item"));

    // Categorize items
    let rugs = items.filter(item => item.dataset.category === "Rug");
    let wallItems = items.filter(item => item.dataset.category === "Wall Item");
    let furnitureAndObjects = items.filter(item => 
        item.dataset.category === "Furniture" || item.dataset.category === "Object"
    );

    // Sort items based on distance from the origin (bottom-center of the room)
    furnitureAndObjects.sort((a, b) => {
        let aY = parseInt(a.style.top) || 0;
        let aX = Math.abs(parseInt(a.style.left) || 0); // Closer to center means higher priority
        let bY = parseInt(b.style.top) || 0;
        let bX = Math.abs(parseInt(b.style.left) || 0);

        return (bY - aY) || (aX - bX); // Lower Y is on top, closer X gets priority
    });

    let zIndex = 1;

    // Rugs get the lowest z-index
    rugs.forEach(item => item.style.zIndex = zIndex++);

    // Wall items are above rugs
    wallItems.forEach(item => item.style.zIndex = zIndex++);

    // Objects and furniture get layered properly
    furnitureAndObjects.forEach(item => item.style.zIndex = zIndex++);
}
