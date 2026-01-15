# 🗺️ Interactive Map View - User Guide

## Overview

The new **Interactive Split-View Map** provides a comprehensive property browsing experience with filters on the left, an interactive map in the center, and property listings on the right.

---

## 🎯 Key Features

### 1. **Three-Panel Layout**

#### **Left Panel - Smart Filters** 🔍
- **Price Range**: Adjust max price with slider (Rs. 5,000 - 100,000)
- **Property Type**: Filter by APARTMENT, HOUSE, ROOM, or FLAT
- **Location**: Filter by city (shows count for each city)
- **Bedrooms**: Select minimum number of bedrooms (0-4+)
- **Special Filters**:
  - ✅ Verified properties only
  - 🌐 Properties with 360° virtual tours
- **Active Filter Badge**: Shows count of active filters
- **Clear Filters**: One-click to reset all filters
- **Results Counter**: Live count of matching properties

#### **Center Panel - Interactive Map** 🗺️
- **Smart Clustering**: Properties cluster together when zoomed out
- **Custom Markers**:
  - 🏠 House icon for houses
  - 🏢 Apartment icon for apartments
  - 🛏️ Bed icon for rooms
  - 🏘️ Building icon for flats
- **Marker Colors**:
  - 🟢 Green = Verified property
  - 🟡 Amber = Unverified property
  - 🔵 Blue = Selected/Hovered property
- **Hover Effects**: Markers enlarge when hovering over property cards
- **Click to Select**: Click marker to center map and highlight property
- **Rich Popups**: Click markers to see property details in popup
- **Info Overlay**: Top bar showing:
  - Total properties count
  - Verified properties count
  - Properties with virtual tours count

#### **Right Panel - Property Cards** 📋
- **Scrollable List**: Browse all matching properties
- **Property Card Info**:
  - High-quality property image
  - Verified badge (if applicable)
  - 360° virtual tour badge (if available)
  - Property title and type
  - Location with map pin icon
  - Bedrooms, bathrooms, and area
  - Monthly rent price
  - Favorite heart button
  - View details button
- **Selection Highlight**: Selected property card has blue ring
- **Hover Sync**: Hovering over cards highlights markers on map
- **Direct Navigation**: Click "View" button to go to property details

---

## 🎮 How to Use

### **Basic Navigation**

1. **Access Map View**:
   - Go to Explore page
   - Click the "Map View" toggle button in the view mode selector

2. **Browse Properties**:
   - Scroll through property cards on the right
   - Click on map markers to see property details
   - Hover over cards to highlight markers

3. **Apply Filters**:
   - Use left sidebar to refine search
   - Filters apply instantly to both map and listings
   - Active filters are highlighted in the header

4. **Select a Property**:
   - Click property card or map marker
   - Map centers on property location
   - Property card is highlighted with blue ring
   - Marker enlarges and turns blue

5. **Add to Favorites**:
   - Click the heart icon on property cards
   - Favorites are saved to local storage
   - View all favorites from Favorites page

6. **View Property Details**:
   - Click "View" button on property card
   - OR click "View Details" in map popup
   - Navigates to full property detail page

### **Panel Management**

- **Collapse Left Panel**: Click X button in filter header
- **Expand Left Panel**: Click chevron button on left edge
- **Collapse Right Panel**: Click X button in listings header
- **Expand Right Panel**: Click chevron button on right edge

### **Map Interaction**

- **Zoom**: Use scroll wheel or zoom buttons
- **Pan**: Click and drag the map
- **Cluster Expansion**: Click on cluster markers to zoom in
- **Popup**: Click markers to see property preview
- **Center on Property**: Click property card to center map

---

## 💡 Tips & Tricks

### **Finding the Perfect Property**

1. **Start Broad**: 
   - Begin with no filters to see all properties
   - Use map to identify interesting areas

2. **Narrow Down**:
   - Apply price range filter first
   - Add location filter for preferred cities
   - Filter by property type if needed

3. **Quality Check**:
   - Enable "Verified only" for quality assurance
   - Enable "360° tour" to preview properties virtually

4. **Compare Properties**:
   - Keep map view open
   - Scroll through listings on the right
   - Click different properties to compare locations

### **Power User Features**

- **Quick Favorites**: Save properties while browsing, review later
- **Area Exploration**: Use clusters to find property hotspots
- **Filter Combinations**: Combine multiple filters for precise results
- **One-Click Reset**: Use "Clear all filters" when starting new search
- **Hover Preview**: Hover over cards to see marker locations without selecting

---

## 🎨 Visual Indicators

### **Map Markers**

| Icon | Meaning |
|------|---------|
| 🟢 Green Pin | Verified property |
| 🟡 Amber Pin | Unverified property |
| 🔵 Blue Pin | Currently selected/hovered |
| 🔵 Number Badge | Cluster with multiple properties |

### **Property Badges**

| Badge | Meaning |
|-------|---------|
| ✓ Verified | Property verified by admin |
| 360° Tour | Virtual tour available |
| APARTMENT/HOUSE/etc | Property type |

### **Filter Status**

- **Blue Badge with Number**: Active filters count
- **Red "Clear" Button**: Filters are active
- **Gray Text**: No filters applied

---

## 🚀 Performance Features

### **Smart Clustering**
- Properties automatically cluster when zoomed out
- Reduces visual clutter
- Shows count in each cluster
- Expands when zooming in

### **Instant Filtering**
- Filters apply immediately without page reload
- Real-time property count updates
- Synchronized between map and listings

### **Responsive Design**
- Works on desktop and tablets
- Collapsible panels for more space
- Touch-friendly controls

---

## 📱 Responsive Behavior

- **Desktop (1200px+)**: Three-panel layout (filters | map | listings)
- **Tablet (768px-1199px)**: Collapsible panels for more space
- **Mobile (<768px)**: Panels stack, toggle between views

---

## 🔧 Technical Details

### **Built With**
- React Leaflet for map rendering
- React Leaflet Cluster for marker clustering
- OpenStreetMap tiles for base map
- Custom SVG markers for properties
- Real-time filter synchronization

### **Data Sources**
- Property data from backend API
- Location coordinates (latitude/longitude)
- User location from browser geolocation API

### **Local Storage**
- Favorites saved locally
- Persists across sessions
- Syncs with Favorites page

---

## 🐛 Troubleshooting

### **Map not loading?**
- Check internet connection (requires map tiles)
- Refresh the page
- Clear browser cache

### **Properties not showing?**
- Check if filters are too restrictive
- Use "Clear all filters" button
- Verify properties have valid coordinates

### **Markers not clustering?**
- Zoom out to see clusters form
- Clusters only appear with 2+ nearby properties
- Click clusters to expand

### **Favorites not saving?**
- Check browser allows local storage
- Try different browser
- Clear browser data and try again

---

## 🎯 Future Enhancements (Planned)

- 🗺️ Multiple map styles (satellite, dark mode)
- 🚗 Distance calculation from your location
- 🔄 Auto-refresh when moving map
- 📍 "Search this area" button
- 🌐 Directions integration
- 📊 Price heatmap overlay
- 🔔 Save search preferences
- 📱 Better mobile responsiveness

---

## 📞 Need Help?

If you encounter any issues or have suggestions:
1. Check this guide first
2. Visit the Help page
3. Contact support through Contact page
4. Report bugs to development team

---

## 🎉 Enjoy Your Property Search!

The new interactive map view makes finding your perfect property easier than ever. Happy hunting! 🏠✨

