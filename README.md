# ⚡ Bolt's Workshop

👉 **[Play Now](https://aditi4275.github.io/bolts_workshop/)** 

**Bolt's Workshop** is a cute, anime-inspired 2D web game built purely with HTML, CSS, and JavaScript. Guide a lone robot named Bolt through 8 unique workshop floors, collect bolts, unlock gates, and build robot friends before time runs out!

---

## ✨ Features

* **🏭 8 Unique Themed Floors:** Progress from the Dusty Basement all the way up to the Core Chamber. Each floor features its own color palette, custom CSS decorations (cobwebs, steam vents, neon circuits, magma, etc.), and custom audio profiles.
* **🔩 Resource Management:** Collect wandering bolts to unlock gates and power up the assembly stations. Reach new bolt milestones (10, 25, 50...) to earn bonus points!
* **🤖 Robot Discovery:** Build distinct robot friends on every floor — each with their own unique anime-inspired palette and backstory.
* **🔮 6 Secret Robots & Powers:** Complete special hidden conditions to unlock legendary robots like *TimeLord*, *Chronos*, *Turbo*, and *Prism*. Unlocking them grants Bolt powerful passive & active abilities!
* **📟 Active Powers HUD:** Whenever you equip consecutive powers, a sleek transparent HUD panel slides in to remind you what powers you possess.
* **📸 End-game Scorecard:** Run out of time? The game generates a customized dynamic Scorecard displaying your metrics and robot gallery, which you can download as a `.png` right to your device!
* **📱 Mobile Friendly:** Fully responsive design with intuitive tap-to-move controls optimized for mobile browsers.
* **🎵 Dynamic Audio Tracker:** Featuring low-latency Web Audio API synthesis that escalates in tempo and pitch during the final 10 seconds of gameplay to create an exciting feeling of urgency.




## 🎮 Controls
* **Mouse/Touch:** Click or tap anywhere in the viewport to move Bolt. Click on gates to unlock them and stations to build robots.
* **Keyboard:** Use `Arrow Left` and `Arrow Right` (or `A` and `D`) to move. Press `Space` or `Enter` when near a prompt to trigger actions.

## 📂 Project Structure

```text
bolts_workshop/
├── index.html        # Main standard entry point (HUD, Modals, Canvases)
├── css/
│   └── style.css     # CSS Variables logic, 8 thematic configurations, robot skins
└── js/
    └── game.js       # Core vanilla engine, Web Audio API, progression logic
```
