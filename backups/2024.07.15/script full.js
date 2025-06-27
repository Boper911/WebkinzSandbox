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
let collectionsWallpaperFlooring = new Set();  // Add this line
let colorsWallpaperFlooring = new Set();       // Add this line

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
            const isDisplayed = dropdown.style.display === 'block';

            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.style.display = 'none';
            });

            if (!isDisplayed) {
                dropdown.style.display = 'block';
            }
        });
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
    const isDisplayed = dropdown.classList.contains('show');

    document.querySelectorAll('.dropdown-content').forEach(content => {
        content.classList.remove('show');
    });

    if (!isDisplayed) {
        dropdown.classList.add('show');
    }
}

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
    const searchTerm = document.getElementById('searchInputLeft').value.toLowerCase();
    const items = document.querySelectorAll('#AllItems .catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        const itemCollection = item.dataset.collection ? item.dataset.collection.toLowerCase().split(',') : [];
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';
        const itemFootprint = item.dataset.footprint ? item.dataset.footprint.toLowerCase() : '';

        const matchesCollection = activeCollections.size === 0 || itemCollection.some(collection => activeCollections.has(collection));
        const matchesColor = activeColors.size === 0 || itemColors.some(color => activeColors.has(color));
        const matchesCategory = activeCategories.size === 0 || activeCategories.has(itemCategory);
        const matchesFootprint = activeFootprints.size === 0 || activeFootprints.has(itemFootprint);

        if (itemName.includes(searchTerm) && matchesCollection && matchesColor && matchesCategory && matchesFootprint) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
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
                itemContainer.className = 'catalog-item';
                itemContainer.dataset.category = item.category;

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

                const name = document.createElement('p');
                name.textContent = item.name;

                itemContainer.appendChild(img);
                itemContainer.appendChild(name);

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
    const searchTerm = document.getElementById('searchInputWallpaperFlooring').value.toLowerCase();
    const items = document.querySelectorAll('#AllWallpaperFlooring .catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        const itemCollections = item.dataset.collection ? JSON.parse(item.dataset.collection).map(col => col.toLowerCase()) : [];
        const itemColors = item.dataset.colors ? JSON.parse(item.dataset.colors).map(color => color.toLowerCase()) : [];
        const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';

        const matchesCollection = activeCollectionsWallpaperFlooring.size === 0 || itemCollections.some(collection => activeCollectionsWallpaperFlooring.has(collection));
        const matchesColor = activeColorsWallpaperFlooring.size === 0 || itemColors.some(color => activeColorsWallpaperFlooring.has(color));
        const matchesCategory = activeCategoriesWallpaperFlooring.size === 0 || activeCategoriesWallpaperFlooring.has(itemCategory);

        if (itemName.includes(searchTerm) && matchesCollection && matchesColor && matchesCategory) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
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

            data.forEach(item => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'catalog-item';

                const img = document.createElement('img');
                img.id = item.name;
                img.src = 'images/backgrounds/' + item.catalogImage;
                img.alt = item.name;
                img.dataset.dropImage = 'images/backgrounds/' + item.dropImage;
                img.onclick = () => setBackground(img);

                const name = document.createElement('p');
                name.textContent = item.name;

                itemContainer.appendChild(img);
                itemContainer.appendChild(name);

                allTab.appendChild(itemContainer);
            });
        })
        .catch(error => console.error('Error fetching JSON:', error));
}

function searchItemsBackgrounds() {
    const searchTerm = document.getElementById('searchInputBackgrounds').value.toLowerCase();
    const items = document.querySelectorAll('#AllBackgrounds .catalog-item');
    items.forEach(item => {
        const itemName = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        if (itemName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
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

function resetAllFiltersBackgrounds() {
    // Placeholder function to reset all filters for backgrounds
    console.log("Reset all filters for backgrounds");
    // Logic for resetting backgrounds filters will be added here in the future
}

function loadItems(data) {
    const allTab = document.getElementById('AllItems');
    allTab.innerHTML = ''; // Clear existing items

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
        img.ondragstart = drag;

        const name = document.createElement('p');
        name.textContent = item.name;

        itemContainer.appendChild(img);
        itemContainer.appendChild(name);

        allTab.appendChild(itemContainer);
    });

    loadCollections([...collections]);
    loadColors([...colors]);
    loadCategories([...categories]);
    loadFootprints([...footprints]);

    filterItems(); // Initialize the filter on load
}

function loadFilters() {
    fetch('catalog.json')
        .then(response => response.json())
        .then(data => {
            const categories = new Set();
            const collections = new Set();
            const colors = new Set();
            const footprints = new Set();

            data.forEach(item => {
                categories.add(item.category);
                collections.add(item.collection);
                item.colors.forEach(color => colors.add(color));
                footprints.add(item.footprint);
            });

            loadCategories([...categories]);
            loadCollections([...collections]);
            loadColors([...colors]);
            loadFootprints([...footprints]);
        })
        .catch(error => console.error('Error fetching JSON:', error));
}
