// 3D Car Racing Game - OPTIMIZED FOR PERFORMANCE
class CarRacingGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.car = null;
        this.aiCar = null;
        this.track = null;
        this.keys = {};
        this.gameStarted = false;
        this.currentLap = 1;
        this.maxLaps = 3;
        this.raceStartTime = 0;
        this.checkpoints = [];
        this.lastCheckpoint = 0;
        
        // Car physics (MASSIVELY INCREASED SPEEDS!)
        this.carSpeed = 0;
        this.maxSpeed = 0.5; // Further reduced overall speed
        this.acceleration = 0.02; // Even slower acceleration  
        this.friction = 0.97; // Slightly better friction
        this.turnSpeed = 0.08; // Adjust turning for slower pace
        this.boostPower = 0; // Boost system
        this.lastBoostTime = 0;
        this.vehicleInfoUpdated = false; // Track if vehicle info UI was updated
        
        // Camera settings (scaled for massive track)
        this.cameraOffset = new THREE.Vector3(0, 25, 40); // Much further back for massive scale
        this.cameraLookOffset = new THREE.Vector3(0, 5, 0);
        
        // Audio
        this.audioContext = null;
        this.engineOscillator = null;
        this.audioInitialized = false;
        
        // Minimap and best time
        this.minimapCanvas = null;
        this.minimapCtx = null;
        this.bestTime = null;
        
        // AI Car properties - REDUCED FOR PERFORMANCE
        this.aiCars = []; // Array to hold multiple AI cars
        this.aiCarsData = []; // Array to hold AI car data (speed, angle, lap, etc.)
        
        // Vehicle selection and trail system
        this.selectedVehicle = 'car';
        this.vehicleTypes = ['car', 'ufo', 'toilet', 'tposing', 'hyperchair'];
        this.vehicleSelectionActive = true;
        this.fishingLines = []; // Array to store fishing line trail points
        
        // Coin Collection System 💰 - OPTIMIZED
        this.coins = []; // Array to hold coin objects
        this.playerCoins = parseInt(localStorage.getItem('racingGameCoins') || '0');
        this.coinsCollectedThisRace = 0;
        
        // Shop and Upgrade System 🛒
        this.vehicleUpgrades = JSON.parse(localStorage.getItem('racingGameUpgrades') || '{}');
        this.boostUpgrades = parseInt(localStorage.getItem('racingGameBoostUpgrades') || '0');
        
        // 💎 GEM SYSTEM & ACHIEVEMENTS 💎
        this.playerGems = parseInt(localStorage.getItem('racingGameGems') || '0');
        this.achievements = JSON.parse(localStorage.getItem('racingGameAchievements') || '{}');
        this.unlockedEvolvedVehicles = JSON.parse(localStorage.getItem('racingGameEvolvedVehicles') || '{}');
        this.raceStats = JSON.parse(localStorage.getItem('racingGameStats') || '{"totalRaces": 0, "wins": 0, "coinsCollected": 0, "distanceTraveled": 0, "boostsUsed": 0, "winningStreak": 0, "racesWithoutCrashing": 0, "totalAirTime": 0, "backwardsDistance": 0, "perfectRaces": 0, "closeFinishes": 0, "lapsLed": 0, "totalCrashes": 0}');
        
        // PERFORMANCE OPTIMIZATION FLAGS
        this.frameCount = 0;
        this.lastPerformanceCheck = 0;
        this.lowPerformanceMode = false;
        
        // Achievement tracking
        this.lastCarPosition = null;

        // Track configurations (longer circuits, default removed)
        // Each entry defines the outer and inner radius of the circular loop.
        // Additional shapes could be added later, but keeping circular ensures existing physics still work.
        this.trackConfigs = [
            { outerRadius: 300, innerRadius: 220 }, // Medium circuit
            { outerRadius: 400, innerRadius: 320 }, // Large circuit
            { outerRadius: 500, innerRadius: 420 }  // Extra-large circuit
        ];

        // Will be chosen in createTrack(). Provide sensible defaults for early access.
        this.currentTrackIndex = 0;
        this.outerRadius = this.trackConfigs[0].outerRadius;
        this.innerRadius = this.trackConfigs[0].innerRadius;
        this.trackRadius = (this.outerRadius + this.innerRadius) / 2;

        // 📦 EVOLVED VEHICLE CATALOG (for gem shop)
        this.evolvedVehicleCatalog = {
            evolved_car:         { name: 'EVOLVED RACING CAR',   cost: 100, emoji: '🏎️' },
            evolved_rocket:      { name: 'OMEGA ROCKET',         cost: 200, emoji: '🚀' },
            evolved_ufo:         { name: 'MOTHER SHIP UFO',      cost: 150, emoji: '🛸' },
            evolved_toilet:      { name: 'GOLDEN THRONE',        cost: 90,  emoji: '🚽' },
            evolved_tposing:     { name: 'ALPHA HUMAN',          cost: 110, emoji: '🧍' },
            evolved_hyperchair:  { name: 'QUANTUM CHAIR',        cost: 130, emoji: '🚀' },
            evolved_electriccar: { name: 'CYBER EV',             cost: 140, emoji: '⚡' },
            evolved_shoppingcart:{ name: 'MEGA MALL CART',       cost: 80,  emoji: '🛒' },
            evolved_duckhorse:   { name: 'MYTHIC QUACKALLOP',    cost: 95,  emoji: '🦆' }
        };

        // 🧹 Clean up deprecated evolved vehicles no longer in the game
        const deprecatedEvolved = ['evolved_aeroplane'];
        let removed = false;
        deprecatedEvolved.forEach(v => {
            if (this.unlockedEvolvedVehicles[v]) {
                delete this.unlockedEvolvedVehicles[v];
                removed = true;
            }
        });
        if (removed) {
            localStorage.setItem('racingGameEvolvedVehicles', JSON.stringify(this.unlockedEvolvedVehicles));
        }

        // Dynamic obstacle & jump pad arrays
        this.movingObstacles = [];
        this.jumpPads = [];
    }
    
    init() {
        try {
            console.log('🎮 Initializing Ultimate Racing Game...');
            console.log('Three.js version:', THREE.REVISION);
            
            this.createScene();
            console.log('✅ Scene created');
            
            this.createLighting();
            console.log('✅ Lighting created');
            
            this.createTrack();
            console.log('✅ Track created');
            
            this.createPlayerVehicle();
            console.log('✅ Player vehicle created');
            
            this.createMultipleAICars();
            console.log('✅ AI cars created');
            
            this.setupCamera();
            console.log('✅ Camera setup');
            
            this.setupControls();
            console.log('✅ Controls setup');
            
            this.setupUI();
            console.log('✅ UI setup');
            
            this.animate();
            console.log('🚀 Game started successfully!');
            console.log('⚡ PERFORMANCE OPTIMIZATIONS ENABLED:');
            console.log('🏆 ACHIEVEMENT TIPS:');
            console.log('   • Complete a race to get "First Race" (10 gems)');
            console.log('   • Press "I" for infinite coins to test shop');
            console.log('   • Win races to unlock more achievements');
            console.log('   • Check browser console for achievement progress');
            console.log('⚡ PERFORMANCE OPTIMIZATIONS ENABLED:');
            console.log('   • Shadow resolution: 512x512 (was 2048x2048)');
            console.log('   • AI cars: 2 (was 4)');
            console.log('   • Coins: 12 (was 30, no sparkles)');
            console.log('   • Trees: 12 (was 80, no shadows)');
            console.log('   • Clouds: 6 (was 30)');
            console.log('   • UI updates: every 3 frames');
            console.log('   • Minimap updates: every 5 frames');
            console.log('   • Fishing trails: DISABLED');
            console.log('   • Materials: Lambert (was Phong)');
            console.log('');
            console.log('💰 SECRET CHEAT CODES:');
            console.log('   • Press "I" for INFINITE COINS! 💰');
            
            // Update vehicle selection based on unlocks
            this.updateVehicleSelection();
            
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            console.error('Error stack:', error.stack);
            alert('Game failed to start!\n\nError: ' + error.message + '\n\nPlease:\n1. Check your internet connection\n2. Refresh the page\n3. Try a different browser\n4. Check browser console (F12) for details');
        }
    }
    
    createScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    createLighting() {
        // Ambient light - BRIGHTENED FOR PERFORMANCE
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);
        
        // Directional light (sun) - OPTIMIZED SHADOWS
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 512; // REDUCED from 2048 for performance
        directionalLight.shadow.mapSize.height = 512; // REDUCED from 2048 for performance
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200; // REDUCED range
        directionalLight.shadow.camera.left = -50; // REDUCED range
        directionalLight.shadow.camera.right = 50; // REDUCED range
        directionalLight.shadow.camera.top = 50; // REDUCED range
        directionalLight.shadow.camera.bottom = -50; // REDUCED range
        this.scene.add(directionalLight);
    }
    
    createTrack() {
        // Randomly select one of the pre-defined track configurations
        this.currentTrackIndex = Math.floor(Math.random() * this.trackConfigs.length);
        const config = this.trackConfigs[this.currentTrackIndex];

        this.outerRadius = config.outerRadius;
        this.innerRadius = config.innerRadius;
        this.trackRadius = (this.outerRadius + this.innerRadius) / 2;

        // Create ground large enough to comfortably fit the selected circuit
        const groundSize = (this.outerRadius + 200) * 2; // extra buffer around the track
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Create race track
        this.createRaceTrack();
        
        // Add environment elements
        this.createEnvironment();
        
        console.log(`��️  Selected Circuit #${this.currentTrackIndex + 1}: outer ${this.outerRadius}, inner ${this.innerRadius}`);
    }
    
    createRaceTrack() {
        // Create circular loop track (size based on selected configuration)
        const outerRadius = this.outerRadius;
        const innerRadius = this.innerRadius;
        
        // Build a circular track made of three arc segments, leaving gaps players must jump
        this.createRingSegments(outerRadius, innerRadius);
        
        // No borders - free driving on the massive track!
        
        // Create checkpoints around the massive loop
        this.checkpoints = [];
        
        // Spawn collectible coins 💰
        this.spawnCoins(outerRadius, innerRadius);
        
        // Create protective barriers at outer edge of circuit
        this.createBarriers(outerRadius);

        // Draw continuous visual borders along inner and outer edges
        // this.createTrackBorders(outerRadius, innerRadius);

        // Moving obstacles & jump pads
        this.createMovingObstacles(outerRadius, innerRadius);
        this.createJumpPads(outerRadius, innerRadius);
    }
    
    createLoopCheckpoints(outerRadius, innerRadius) {
        const checkpointCount = 8;
        this.checkpoints = [];
        const trackRadius = (outerRadius + innerRadius) / 2; // Middle of the track
        
        for (let i = 0; i < checkpointCount; i++) {
            // Place checkpoints around the circular track
            const angle = (i / checkpointCount) * Math.PI * 2;
            const x = Math.cos(angle) * trackRadius;
            const z = Math.sin(angle) * trackRadius;
            
            // Create checkpoint marker (vertical pillars)
            const pillarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 8);
            const pillarMaterial = new THREE.MeshLambertMaterial({ 
                color: i === 0 ? 0x00ff00 : 0xffff00, // Green for start/finish, yellow for others
                emissive: i === 0 ? 0x003300 : 0x333300
            });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(x, 4, z);
            pillar.castShadow = true;
            this.scene.add(pillar);
            
            // Add floating checkpoint ring above the pillar
            const ringGeometry = new THREE.TorusGeometry(3, 0.3, 8, 16);
            const ringMaterial = new THREE.MeshLambertMaterial({ 
                color: i === 0 ? 0x00ff00 : 0xffff00,
                transparent: true,
                opacity: 0.8
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(x, 6, z);
            ring.rotation.x = Math.PI / 2;
            this.scene.add(ring);
            
            this.checkpoints.push({
                position: new THREE.Vector3(x, 0, z),
                passed: false,
                index: i
            });
        }
    }
    
    spawnCoins(outerRadius, innerRadius) {
        this.coins = []; // Reset coins array
        const coinCount = 12; // REDUCED from 30 for performance
        const trackRadius = (outerRadius + innerRadius) / 2;
        
        // Shared geometry and materials for performance
        const coinGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3);
        const coinMaterial = new THREE.MeshLambertMaterial({ // CHANGED from Phong for performance
            color: 0xFFD700, // Gold color
            emissive: 0x332200
        });
        
        for (let i = 0; i < coinCount; i++) {
            // Random angle around the track
            const angle = (Math.random() * Math.PI * 2);
            
            // Random radius within track bounds (with some variation)
            const radiusVariation = (Math.random() - 0.5) * 30; // ±15 variation
            const radius = trackRadius + radiusVariation;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // Create simple coin object - NO SPARKLES for performance
            const coin = new THREE.Mesh(coinGeometry, coinMaterial);
            coin.position.set(x, 3, z); // Floating above ground
            coin.castShadow = false; // DISABLED for performance
            coin.userData = { 
                type: 'coin', 
                value: 15 + Math.floor(Math.random() * 25), // Increased value since fewer coins
                collected: false,
                rotationSpeed: 0.02 + Math.random() * 0.02 // Random rotation speed
            };
            
            this.scene.add(coin);
            this.coins.push(coin);
        }
        
        console.log(`💰 Spawned ${coinCount} coins around the track! (OPTIMIZED)`);
    }
    
    updateCoins() {
        if (!this.coins || this.coins.length === 0) return;
        
        this.coins.forEach((coin, index) => {
            if (coin.userData.collected) return;
            
            // Rotate coin for visual effect
            coin.rotation.y += coin.userData.rotationSpeed;
            
            // Bob up and down
            const time = Date.now() * 0.001;
            coin.position.y = 3 + Math.sin(time * 2 + index) * 0.5;
            
            // Check collision with player
            if (this.car) {
                const distance = this.car.position.distanceTo(coin.position);
                if (distance < 4) { // Collection radius
                    this.collectCoin(coin, index);
                }
            }
        });
    }
    
    collectCoin(coin, index) {
        coin.userData.collected = true;
        let coinValue = coin.userData.value;
        
        // Shop vehicle bonus: +50% coins
        if (this.selectedVehicle === 'shopvehicle') {
            coinValue = Math.floor(coinValue * 1.5);
        }
        
        // Add coins to player
        this.playerCoins += coinValue;
        this.coinsCollectedThisRace += coinValue;
        this.updateRaceStats('coinsCollected', coinValue);
        
        // Save to localStorage
        localStorage.setItem('racingGameCoins', this.playerCoins.toString());
        
        // Visual feedback - make coin disappear with effect
        coin.scale.set(0.1, 0.1, 0.1);
        coin.rotation.y += 0.5;
        
        // Remove coin from scene and array after brief delay
        setTimeout(() => {
            this.scene.remove(coin);
            this.coins.splice(index, 1);
        }, 200);
        
        // Play collection sound
        this.playCoinSound();
        
        const bonusText = this.selectedVehicle === 'shopvehicle' ? ' (+50% BONUS!)' : '';
        console.log(`💰 Collected ${coinValue} coins${bonusText}! Total: ${this.playerCoins}`);
    }
    
    playCoinSound() {
        if (!this.audioInitialized) return;
        
        // Create a pleasant ding sound for coin collection
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    playCheatSound() {
        if (!this.audioInitialized) return;
        
        // Create an epic cheat activation sound
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator1.type = 'square';
        oscillator2.type = 'sawtooth';
        
        // Rising tone effect
        oscillator1.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
        
        oscillator2.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator1.start();
        oscillator2.start();
        oscillator1.stop(this.audioContext.currentTime + 0.8);
        oscillator2.stop(this.audioContext.currentTime + 0.8);
        
        console.log('🎵 Epic cheat sound played!');
    }
    
    // 💎 ACHIEVEMENTS SYSTEM 💎
    checkAchievements() {
        const newAchievements = [];
        
        // Define all achievements
        const achievementList = {
            'first_race': { name: 'First Race', desc: 'Complete your first race', gems: 10, check: () => this.raceStats.totalRaces >= 1 },
            'speed_demon': { name: 'Speed Demon', desc: 'Win 5 races', gems: 25, check: () => this.raceStats.wins >= 5 },
            'coin_collector': { name: 'Coin Collector', desc: 'Collect 500 coins total', gems: 15, check: () => this.raceStats.coinsCollected >= 500 },
            'boost_master': { name: 'Boost Master', desc: 'Use boost 100 times', gems: 20, check: () => this.raceStats.boostsUsed >= 100 },
            'marathon_runner': { name: 'Marathon Runner', desc: 'Travel 10,000 units', gems: 30, check: () => this.raceStats.distanceTraveled >= 10000 },
            'race_veteran': { name: 'Race Veteran', desc: 'Complete 20 races', gems: 40, check: () => this.raceStats.totalRaces >= 20 },
            'champion': { name: 'Champion', desc: 'Win 25 races', gems: 75, check: () => this.raceStats.wins >= 25 },
            'gem_hunter': { name: 'Gem Hunter', desc: 'Collect 100 gems', gems: 50, check: () => this.playerGems >= 100 },
            'ultimate_racer': { name: 'Ultimate Racer', desc: 'Complete 50 races', gems: 100, check: () => this.raceStats.totalRaces >= 50 },
            'legendary': { name: 'Legendary', desc: 'Win 50 races', gems: 200, check: () => this.raceStats.wins >= 50 },
            'winning_streak_3': { name: 'Hot Streak', desc: 'Win 3 races in a row', gems: 30, check: () => this.raceStats.winningStreak >= 3 },
            'winning_streak_10': { name: 'Unstoppable', desc: 'Win 10 races in a row', gems: 100, check: () => this.raceStats.winningStreak >= 10 },
            'crash_addict_10': { name: 'Bumper Cars', desc: 'Crash 10 times', gems: 5, check: () => this.raceStats.totalCrashes >= 10 },
            'crash_addict_50': { name: 'Wrecking Ball', desc: 'Crash 50 times', gems: 20, check: () => this.raceStats.totalCrashes >= 50 },
            'crash_addict_100': { name: 'Chaos Incarnate', desc: 'Crash 100 times', gems: 50, check: () => this.raceStats.totalCrashes >= 100 },
            'no_crashes_5': { name: 'Clean Racer', desc: 'Finish 5 races without crashing', gems: 40, check: () => this.raceStats.racesWithoutCrashing >= 5 },
            'no_crashes_10': { name: 'Untouchable', desc: 'Finish 10 races without crashing', gems: 80, check: () => this.raceStats.racesWithoutCrashing >= 10 },
            'air_time_30': { name: 'Frequent Flyer', desc: 'Get 30 seconds of total air time', gems: 15, check: () => this.raceStats.totalAirTime >= 30 },
            'air_time_120': { name: 'Airborne', desc: 'Get 120 seconds of total air time', gems: 45, check: () => this.raceStats.totalAirTime >= 120 },
            'backwards_500': { name: 'Show Off', desc: 'Drive backwards for 500 units of distance', gems: 20, check: () => this.raceStats.backwardsDistance >= 500 },
            'backwards_2000': { name: 'Reverse King', desc: 'Drive backwards for 2000 units of distance', gems: 60, check: () => this.raceStats.backwardsDistance >= 2000 },
            'perfect_race_1': { name: 'Flawless Victory', desc: 'Win a race leading every lap', gems: 25, check: () => this.raceStats.perfectRaces >= 1 },
            'perfect_race_5': { name: 'Dominator', desc: 'Win 5 races leading every lap', gems: 75, check: () => this.raceStats.perfectRaces >= 5 },
            'collector_1000': { name: 'Coin Magnet', desc: 'Collect 1000 coins', gems: 25, check: () => this.raceStats.coinsCollected >= 1000 },
            'collector_5000': { name: 'Coin Hoarder', desc: 'Collect 5000 coins', gems: 75, check: () => this.raceStats.coinsCollected >= 5000 },
            'boost_maniac_250': { name: 'Boost Junkie', desc: 'Use boost 250 times', gems: 30, check: () => this.raceStats.boostsUsed >= 250 },
            'boost_maniac_500': { name: 'Need for Speed', desc: 'Use boost 500 times', gems: 60, check: () => this.raceStats.boostsUsed >= 500 },
            'long_journey_25000': { name: 'Road Trippin\'', desc: 'Travel 25,000 units', gems: 40, check: () => this.raceStats.distanceTraveled >= 25000 },
            'long_journey_100000': { name: 'Globe Trotter', desc: 'Travel 100,000 units', gems: 120, check: () => this.raceStats.distanceTraveled >= 100000 },
            'race_enthusiast_100': { name: 'Race Enthusiast', desc: 'Complete 100 races', gems: 150, check: () => this.raceStats.totalRaces >= 100 },
            'win_master_100': { name: 'Win Master', desc: 'Win 100 races', gems: 300, check: () => this.raceStats.wins >= 100 },
            'gem_master_250': { name: 'Gem Tycoon', desc: 'Collect 250 gems', gems: 80, check: () => this.playerGems >= 250 },
            'gem_master_1000': { name: 'Gemperor', desc: 'Collect 1000 gems', gems: 250, check: () => this.playerGems >= 1000 },
            'unlock_all_evolved': { name: 'Evolution Complete', desc: 'Unlock all evolved vehicles', gems: 200, check: () => Object.keys(this.unlockedEvolvedVehicles).length >= 11 },
            'all_upgrades': { name: 'Maxed Out', desc: 'Purchase all vehicle and boost upgrades', gems: 150, check: () => this.boostUpgrades >= 5 && Object.keys(this.vehicleUpgrades).length >= 3 },
            'win_with_car': { name: 'Classic Win', desc: 'Win a race with the default car', gems: 10, check: () => this.raceStats.wins_car >= 1 },
            'win_with_aeroplane': { name: 'A-10 Warthog', desc: 'Win a race with the aeroplane', gems: 10, check: () => this.raceStats.wins_aeroplane >= 1 },
            'win_with_ufo': { name: 'Alien Overlord', desc: 'Win a race with the UFO', gems: 10, check: () => this.raceStats.wins_ufo >= 1 },
            'win_with_toilet': { name: 'Porcelain God', desc: 'Win a race with the toilet', gems: 10, check: () => this.raceStats.wins_toilet >= 1 },
            'win_with_tposing': { name: 'Asserting Dominance', desc: 'Win a race with the T-posing man', gems: 10, check: () => this.raceStats.wins_tposing >= 1 },
            'win_with_hyperchair': { name: 'Office Champion', desc: 'Win a race with the hyperchair', gems: 10, check: () => this.raceStats.wins_hyperchair >= 1 },
            'win_with_electriccar': { name: 'Future is Now', desc: 'Win a race with the electric car', gems: 10, check: () => this.raceStats.wins_electriccar >= 1 },
            'win_with_shoppingcart': { name: 'Cleanup on Aisle 3', desc: 'Win a race with the shopping cart', gems: 10, check: () => this.raceStats.wins_shoppingcart >= 1 },
            'win_with_duckhorse': { name: 'Quackallop', desc: 'Win a race with the duck horse', gems: 10, check: () => this.raceStats.wins_duckhorse >= 1 },
            'win_with_rocket': { name: 'To the Moon!', desc: 'Win a race with the rocket', gems: 10, check: () => this.raceStats.wins_rocket >= 1 },
            'win_with_shopvehicle': { name: 'Consumerism', desc: 'Win a race with the shop vehicle', gems: 10, check: () => this.raceStats.wins_shopvehicle >= 1 },
            'win_with_walkingcooler': { name: 'Ice Cold', desc: 'Win a race with the walking cooler', gems: 10, check: () => this.raceStats.wins_walkingcooler >= 1 },
            'first_gem': { name: 'Shiny!', desc: 'Earn your first gem', gems: 5, check: () => this.playerGems > 0 },
            'first_upgrade': { name: 'Tinkerer', desc: 'Buy your first upgrade', gems: 10, check: () => Object.keys(this.vehicleUpgrades).length > 0 || this.boostUpgrades > 0 },
            'first_evolved': { name: 'Next Level', desc: 'Unlock your first evolved vehicle', gems: 20, check: () => Object.keys(this.unlockedEvolvedVehicles).length > 0 },
            'close_call': { name: 'Photo Finish', desc: 'Win a race by less than a second', gems: 30, check: () => this.raceStats.closeFinishes > 0 },
            'no_boost_win': { name: 'Natural Talent', desc: 'Win a race without using boost', gems: 50, check: () => this.raceStats.wins_no_boost > 0 },
            'lap_opponent': { name: 'Lapped!', desc: 'Lap an opponent in a race', gems: 25, check: () => this.raceStats.laps_led > this.maxLaps },
            '10k_coins': { name: 'High Roller', desc: 'Have 10,000 coins at once', gems: 50, check: () => this.playerCoins >= 10000 },
            '500_gems': { name: 'Gemstone Collector', desc: 'Have 500 gems at once', gems: 100, check: () => this.playerGems >= 500 },
            'all_achievements': { name: 'Completionist', desc: 'Unlock all other achievements', gems: 500, check: () => Object.keys(this.achievements).length >= 99 },
            'race_5_times': { name: 'Just Getting Started', desc: 'Complete 5 races.', gems: 5, check: () => this.raceStats.totalRaces >= 5 },
            'race_10_times': { name: 'Warming Up', desc: 'Complete 10 races.', gems: 10, check: () => this.raceStats.totalRaces >= 10 },
            'win_2_times': { name: 'Twice as Nice', desc: 'Win 2 races.', gems: 10, check: () => this.raceStats.wins >= 2 },
            'coins_100': { name: 'Pocket Change', desc: 'Collect 100 coins total.', gems: 5, check: () => this.raceStats.coinsCollected >= 100 },
            'boost_25': { name: 'Booster', desc: 'Use boost 25 times.', gems: 10, check: () => this.raceStats.boostsUsed >= 25 },
            'travel_1000': { name: 'On the Road', desc: 'Travel 1,000 units.', gems: 10, check: () => this.raceStats.distanceTraveled >= 1000 },
            'crash_5': { name: 'Fender Bender', desc: 'Crash 5 times.', gems: 2, check: () => this.raceStats.totalCrashes >= 5 },
            'air_5': { name: 'Got Air?', desc: 'Get 5 seconds of air time.', gems: 5, check: () => this.raceStats.totalAirTime >= 5 },
            'backwards_100': { name: 'Moonwalker', desc: 'Drive backwards for 100 units.', gems: 5, check: () => this.raceStats.backwardsDistance >= 100 },
            'one_lap': { name: 'Lap One Complete', desc: 'Complete one lap.', gems: 2, check: () => this.currentLap > 1 },
            'one_gem': { name: 'My Precious', desc: 'Get one gem.', gems: 1, check: () => this.playerGems >= 1 },
            'ten_gems': { name: 'Gem Enthusiast', desc: 'Get 10 gems.', gems: 5, check: () => this.playerGems >= 10 },
            'win_streak_2': { name: 'Two in a Row', desc: 'Win 2 races in a row.', gems: 15, check: () => this.raceStats.winningStreak >= 2 },
            'no_crash_1': { name: 'Clean Lap', desc: 'Finish a race without crashing.', gems: 20, check: () => this.raceStats.racesWithoutCrashing >= 1 },
            'perfect_lap': { name: 'Perfect Lap', desc: 'Lead a lap from start to finish.', gems: 10, check: () => this.raceStats.lapsLed >= 1 },
            'coins_250': { name: 'Getting Richer', desc: 'Collect 250 coins.', gems: 10, check: () => this.raceStats.coinsCollected >= 250 },
            'boost_50': { name: 'Boost-happy', desc: 'Use boost 50 times.', gems: 15, check: () => this.raceStats.boostsUsed >= 50 },
            'travel_5000': { name: 'Road Warrior', desc: 'Travel 5,000 units.', gems: 20, check: () => this.raceStats.distanceTraveled >= 5000 },
            'crash_25': { name: 'Serious about Crashing', desc: 'Crash 25 times.', gems: 10, check: () => this.raceStats.totalCrashes >= 25 },
            'air_15': { name: 'Eagle Eye', desc: 'Get 15 seconds of air time.', gems: 10, check: () => this.raceStats.totalAirTime >= 15 },
            'backwards_250': { name: 'Wrong Way', desc: 'Drive backwards for 250 units.', gems: 10, check: () => this.raceStats.backwardsDistance >= 250 },
            'unlock_vehicle': { name: 'New Ride', desc: 'Unlock a new vehicle.', gems: 10, check: () => Object.keys(this.unlockedEvolvedVehicles).length > 0 },
            'buy_speed': { name: 'Speed Freak', desc: 'Buy a speed upgrade.', gems: 5, check: () => this.vehicleUpgrades.speed > 0 },
            'buy_accel': { name: 'Quick Start', desc: 'Buy an acceleration upgrade.', gems: 5, check: () => this.vehicleUpgrades.acceleration > 0 },
            'buy_turning': { name: 'Corner Master', desc: 'Buy a turning upgrade.', gems: 5, check: () => this.vehicleUpgrades.turning > 0 },
        };
        
        // Check each achievement
        for (const [id, achievement] of Object.entries(achievementList)) {
            if (!this.achievements[id] && achievement.check()) {
                this.achievements[id] = true;
                this.playerGems += achievement.gems;
                newAchievements.push(achievement);
                
                // Save progress
                localStorage.setItem('racingGameAchievements', JSON.stringify(this.achievements));
                localStorage.setItem('racingGameGems', this.playerGems.toString());
                
                console.log(`🏆 ACHIEVEMENT UNLOCKED: ${achievement.name} (+${achievement.gems} gems)`);
            }
        }
        
        // Show achievement notifications
        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements);
        }
    }
    
    showAchievementNotification(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.textContent = `🏆 ${achievement.name} (+${achievement.gems} 💎)`;
                notification.style.position = 'fixed';
                notification.style.top = `${100 + index * 60}px`;
                notification.style.right = '20px';
                notification.style.backgroundColor = '#9900ff';
                notification.style.color = '#ffffff';
                notification.style.padding = '15px 25px';
                notification.style.borderRadius = '10px';
                notification.style.fontSize = '16px';
                notification.style.fontWeight = 'bold';
                notification.style.border = '2px solid #bb44ff';
                notification.style.zIndex = '10001';
                notification.style.boxShadow = '0 0 15px rgba(153, 0, 255, 0.8)';
                notification.style.animation = 'slideInRight 0.5s ease-out';
                
                document.body.appendChild(notification);
                
                // Remove after 4 seconds
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 4000);
            }, index * 500); // Stagger multiple achievements
        });
    }
    
    updateRaceStats(type, value = 1) {
        this.raceStats[type] += value;
        localStorage.setItem('racingGameStats', JSON.stringify(this.raceStats));
        this.checkAchievements();
    }
    
    setupShop() {
        // Shop button event
        document.getElementById('openShopBtn').addEventListener('click', () => {
            this.openShop();
        });
        
        // Close shop button
        document.getElementById('closeShopBtn').addEventListener('click', () => {
            this.closeShop();
        });
        
        // Vehicle upgrade buttons
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                const cost = parseInt(e.target.getAttribute('data-cost'));
                this.buyVehicleUpgrade(type, cost);
            });
        });
        
        // Boost upgrade button
        document.getElementById('boostUpgradeBtn').addEventListener('click', () => {
            const cost = parseInt(document.getElementById('boostUpgradeBtn').getAttribute('data-cost'));
            this.buyBoostUpgrade(cost);
        });
        
        // Vehicle unlock buttons
        document.querySelectorAll('.vehicle-unlock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const vehicle = e.target.getAttribute('data-vehicle');
                const cost = parseInt(e.target.getAttribute('data-cost'));
                this.unlockVehicle(vehicle, cost);
            });
        });
    }
    
    openShop() {
        document.getElementById('shopScreen').style.display = 'flex';
        this.updateShopDisplay();
    }
    
    closeShop() {
        document.getElementById('shopScreen').style.display = 'none';
    }
    
    updateShopDisplay() {
        // Update coin display
        document.getElementById('shopCoins').textContent = this.playerCoins;
        
        // Update boost level
        document.getElementById('boostLevel').textContent = this.boostUpgrades;
        
        // Update boost upgrade button
        const boostBtn = document.getElementById('boostUpgradeBtn');
        if (this.boostUpgrades >= 4) {
            boostBtn.textContent = 'MAX LEVEL!';
            boostBtn.style.background = '#666';
            boostBtn.disabled = true;
        } else {
            const cost = 150 + (this.boostUpgrades * 50);
            boostBtn.setAttribute('data-cost', cost);
            boostBtn.textContent = `Buy for ${cost} 💰`;
            boostBtn.disabled = this.playerCoins < cost;
            boostBtn.style.background = this.playerCoins >= cost ? '#ffff00' : '#666';
        }
        
        // Update vehicle upgrade buttons
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            const type = btn.getAttribute('data-type');
            const cost = parseInt(btn.getAttribute('data-cost'));
            const currentUpgrades = this.vehicleUpgrades[this.selectedVehicle] || {};
            const currentLevel = currentUpgrades[type] || 0;
            
            if (currentLevel >= 3) {
                btn.textContent = 'MAX LEVEL!';
                btn.style.background = '#666';
                btn.disabled = true;
            } else {
                const actualCost = cost + (currentLevel * 50);
                btn.textContent = `Buy for ${actualCost} 💰`;
                btn.disabled = this.playerCoins < actualCost;
                btn.style.background = this.playerCoins >= actualCost ? btn.style.background : '#666';
            }
        });
        
        // Update vehicle unlock buttons  
        document.querySelectorAll('.vehicle-unlock-btn').forEach(btn => {
            const vehicle = btn.getAttribute('data-vehicle');
            const cost = parseInt(btn.getAttribute('data-cost'));
            
            if (this.isVehicleUnlocked(vehicle)) {
                btn.textContent = 'UNLOCKED!';
                btn.style.background = '#00ff00';
                btn.disabled = true;
            } else {
                btn.disabled = this.playerCoins < cost;
                btn.style.background = this.playerCoins >= cost ? btn.style.background : '#666';
            }
        });
    }
    
    buyVehicleUpgrade(type, baseCost) {
        const currentUpgrades = this.vehicleUpgrades[this.selectedVehicle] || {};
        const currentLevel = currentUpgrades[type] || 0;
        
        if (currentLevel >= 3) {
            alert('Maximum upgrade level reached for this stat!');
            return;
        }
        
        const actualCost = baseCost + (currentLevel * 50);
        
        if (this.playerCoins < actualCost) {
            alert('Not enough coins!');
            return;
        }
        
        // Deduct coins
        this.playerCoins -= actualCost;
        localStorage.setItem('racingGameCoins', this.playerCoins.toString());
        
        // Apply upgrade
        if (!this.vehicleUpgrades[this.selectedVehicle]) {
            this.vehicleUpgrades[this.selectedVehicle] = {};
        }
        this.vehicleUpgrades[this.selectedVehicle][type] = currentLevel + 0.3;
        localStorage.setItem('racingGameUpgrades', JSON.stringify(this.vehicleUpgrades));
        
        console.log(`💰 Purchased ${type} upgrade for ${this.selectedVehicle}! New level: ${this.vehicleUpgrades[this.selectedVehicle][type]}`);
        
        // Update shop display
        this.updateShopDisplay();
        
        // Play purchase sound
        this.playPurchaseSound();
    }
    
    buyBoostUpgrade(baseCost) {
        if (this.boostUpgrades >= 4) {
            alert('Maximum boost upgrade level reached!');
            return;
        }
        
        const actualCost = baseCost + (this.boostUpgrades * 50);
        
        if (this.playerCoins < actualCost) {
            alert('Not enough coins!');
            return;
        }
        
        // Deduct coins
        this.playerCoins -= actualCost;
        localStorage.setItem('racingGameCoins', this.playerCoins.toString());
        
        // Apply upgrade
        this.boostUpgrades++;
        localStorage.setItem('racingGameBoostUpgrades', this.boostUpgrades.toString());
        
        console.log(`💰 Purchased boost upgrade! New level: ${this.boostUpgrades}`);
        
        // Update shop display
        this.updateShopDisplay();
        
        // Play purchase sound
        this.playPurchaseSound();
    }
    
    unlockVehicle(vehicle, cost) {
        if (this.isVehicleUnlocked(vehicle)) {
            alert('Vehicle already unlocked!');
            return;
        }
        
        if (this.playerCoins < cost) {
            alert('Not enough coins!');
            return;
        }
        
        // Deduct coins
        this.playerCoins -= cost;
        localStorage.setItem('racingGameCoins', this.playerCoins.toString());
        
        // Unlock vehicle
        const unlockedVehicles = JSON.parse(localStorage.getItem('racingGameUnlockedVehicles') || '[]');
        unlockedVehicles.push(vehicle);
        localStorage.setItem('racingGameUnlockedVehicles', JSON.stringify(unlockedVehicles));
        
        console.log(`💰 Unlocked ${vehicle}!`);
        
        // Update shop display
        this.updateShopDisplay();
        
        // Show vehicle in selection screen
        this.updateVehicleSelection();
        
        // Play purchase sound
        this.playPurchaseSound();
    }
    
    isVehicleUnlocked(vehicle) {
        // Basic vehicles are always unlocked
        const basicVehicles = ['car', 'ufo', 'toilet', 'tposing', 'hyperchair', 'electriccar', 'shoppingcart', 'duckhorse', 'walkingcooler'];
        if (basicVehicles.includes(vehicle)) return true;
        
        // Check if premium vehicle is unlocked
        const unlockedVehicles = JSON.parse(localStorage.getItem('racingGameUnlockedVehicles') || '[]');
        return unlockedVehicles.includes(vehicle);
    }
    
    updateVehicleSelection() {
        // Enable/disable vehicle options based on unlock status
        document.querySelectorAll('.vehicle-option').forEach(option => {
            const vehicle = option.getAttribute('data-vehicle');
            if (!this.isVehicleUnlocked(vehicle)) {
                option.style.opacity = '0.5';
                option.style.pointerEvents = 'none';
                option.style.border = '2px solid #333';
            } else {
                option.style.opacity = '1';
                option.style.pointerEvents = 'auto';
            }
        });

        // Dynamically inject evolved vehicles that have been unlocked but have no option element yet
        const container = document.getElementById('vehicleSelection');
        if (!container) return;

        const emojiMap = {
            evolved_car: '🏎️',
            evolved_rocket: '🚀',
            evolved_ufo: '🛸',
            evolved_toilet: '🚽',
            evolved_tposing: '🧍',
            evolved_hyperchair: '🚀',
            evolved_electriccar: '⚡',
            evolved_shoppingcart: '🛒',
            evolved_duckhorse: '🦆'
        };

        Object.keys(this.unlockedEvolvedVehicles).forEach(ev => {
            if (container.querySelector(`[data-vehicle="${ev}"]`)) return; // already exists

            const div = document.createElement('div');
            div.className = 'vehicle-option';
            div.setAttribute('data-vehicle', ev);
            div.style.cssText = 'margin:10px;padding:15px;border:3px solid #4CAF50;border-radius:10px;cursor:pointer;text-align:center;background:rgba(255,255,255,0.1)';
            div.innerHTML = `<div style="font-size:40px;">${emojiMap[ev] || '✨'}</div><div style="font-weight:bold;margin-top:5px;">${ev.replace('evolved_','').replace(/_/g,' ').toUpperCase()}</div><div style="font-size:12px;">EVOLVED</div>`;
            container.appendChild(div);

            // Attach click handler
            div.addEventListener('click', () => {
                // Remove selection from all options
                document.querySelectorAll('.vehicle-option').forEach(opt => opt.style.border = '2px solid #666');
                div.style.border = '3px solid #4CAF50';
                this.selectedVehicle = ev;
            });
        });
    }
    
    playPurchaseSound() {
        if (!this.audioInitialized) return;
        
        // Create a satisfying purchase sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }
    
    // 💎 GEM SHOP SYSTEM 💎
    openGemShop() {
        // Ensure UI is built
        this.buildGemShopUI();
        document.getElementById('gemShopScreen').style.display = 'flex';
        document.getElementById('shopGems').textContent = this.playerGems;
        this.updateGemShopDisplay();
    }
    
    closeGemShop() {
        document.getElementById('gemShopScreen').style.display = 'none';
    }
    
    updateGemShopDisplay() {
        document.getElementById('shopGems').textContent = this.playerGems;
        
        // Update evolved vehicle buttons
        const evolvedVehicleButtons = document.querySelectorAll('.evolved-vehicle-btn');
        evolvedVehicleButtons.forEach(button => {
            const vehicle = button.getAttribute('data-vehicle');
            const cost = parseInt(button.getAttribute('data-cost'));
            
            if (this.unlockedEvolvedVehicles[vehicle]) {
                button.textContent = '✅ UNLOCKED';
                button.style.background = '#00aa00';
                button.disabled = true;
            } else if (this.playerGems >= cost) {
                button.style.background = ''; // Clear background to use CSS default
                button.disabled = false;
            } else {
                button.style.background = 'rgba(50,50,50,0.8)';
                button.disabled = true;
            }
        });
    }
    
    unlockEvolvedVehicle(vehicle, cost) {
        if (this.playerGems >= cost && !this.unlockedEvolvedVehicles[vehicle]) {
            this.playerGems -= cost;
            this.unlockedEvolvedVehicles[vehicle] = true;
            
            localStorage.setItem('racingGameGems', this.playerGems.toString());
            localStorage.setItem('racingGameEvolvedVehicles', JSON.stringify(this.unlockedEvolvedVehicles));
            
            this.updateGemShopDisplay();
            this.updateVehicleSelection();
            this.playPurchaseSound();
            
            console.log(`💎 EVOLVED VEHICLE UNLOCKED: ${vehicle}!`);
            
            // Show unlock notification
            const notification = document.createElement('div');
            notification.textContent = `🔥 EVOLVED VEHICLE UNLOCKED! 🔥`;
            notification.style.position = 'fixed';
            notification.style.top = '50%';
            notification.style.left = '50%';
            notification.style.transform = 'translate(-50%, -50%)';
            notification.style.backgroundColor = '#9900ff';
            notification.style.color = '#ffffff';
            notification.style.padding = '25px 50px';
            notification.style.borderRadius = '20px';
            notification.style.fontSize = '28px';
            notification.style.fontWeight = 'bold';
            notification.style.border = '3px solid #bb44ff';
            notification.style.zIndex = '10000';
            notification.style.boxShadow = '0 0 30px rgba(153, 0, 255, 0.8)';
            notification.style.animation = 'pulse 0.8s ease-in-out';
            
            document.body.appendChild(notification);
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 4000);
        }
    }
    
    // 🏆 ACHIEVEMENTS SYSTEM 🏆
    showAchievements() {
        document.getElementById('achievementsScreen').style.display = 'flex';
        this.updateAchievementsDisplay();
    }
    
    closeAchievements() {
        document.getElementById('achievementsScreen').style.display = 'none';
    }
    
    updateAchievementsDisplay() {
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';
        
        const achievementDefinitions = {
            'first_race': { name: 'First Race', desc: 'Complete your first race', gems: 10, check: () => this.raceStats.totalRaces >= 1 },
            'speed_demon': { name: 'Speed Demon', desc: 'Win 5 races', gems: 25, check: () => this.raceStats.wins >= 5 },
            'coin_collector': { name: 'Coin Collector', desc: 'Collect 500 coins total', gems: 15, check: () => this.raceStats.coinsCollected >= 500 },
            'boost_master': { name: 'Boost Master', desc: 'Use boost 100 times', gems: 20, check: () => this.raceStats.boostsUsed >= 100 },
            'marathon_runner': { name: 'Marathon Runner', desc: 'Travel 10,000 units', gems: 30, check: () => this.raceStats.distanceTraveled >= 10000 },
            'race_veteran': { name: 'Race Veteran', desc: 'Complete 20 races', gems: 40, check: () => this.raceStats.totalRaces >= 20 },
            'champion': { name: 'Champion', desc: 'Win 25 races', gems: 75, check: () => this.raceStats.wins >= 25 },
            'gem_hunter': { name: 'Gem Hunter', desc: 'Collect 100 gems', gems: 50, check: () => this.playerGems >= 100 },
            'ultimate_racer': { name: 'Ultimate Racer', desc: 'Complete 50 races', gems: 100, check: () => this.raceStats.totalRaces >= 50 },
            'legendary': { name: 'Legendary', desc: 'Win 50 races', gems: 200, check: () => this.raceStats.wins >= 50 },
            'winning_streak_3': { name: 'Hot Streak', desc: 'Win 3 races in a row', gems: 30, check: () => this.raceStats.winningStreak >= 3 },
            'winning_streak_10': { name: 'Unstoppable', desc: 'Win 10 races in a row', gems: 100, check: () => this.raceStats.winningStreak >= 10 },
            'crash_addict_10': { name: 'Bumper Cars', desc: 'Crash 10 times', gems: 5, check: () => this.raceStats.totalCrashes >= 10 },
            'crash_addict_50': { name: 'Wrecking Ball', desc: 'Crash 50 times', gems: 20, check: () => this.raceStats.totalCrashes >= 50 },
            'crash_addict_100': { name: 'Chaos Incarnate', desc: 'Crash 100 times', gems: 50, check: () => this.raceStats.totalCrashes >= 100 },
            'no_crashes_5': { name: 'Clean Racer', desc: 'Finish 5 races without crashing', gems: 40, check: () => this.raceStats.racesWithoutCrashing >= 5 },
            'no_crashes_10': { name: 'Untouchable', desc: 'Finish 10 races without crashing', gems: 80, check: () => this.raceStats.racesWithoutCrashing >= 10 },
            'air_time_30': { name: 'Frequent Flyer', desc: 'Get 30 seconds of total air time', gems: 15, check: () => this.raceStats.totalAirTime >= 30 },
            'air_time_120': { name: 'Airborne', desc: 'Get 120 seconds of total air time', gems: 45, check: () => this.raceStats.totalAirTime >= 120 },
            'backwards_500': { name: 'Show Off', desc: 'Drive backwards for 500 units of distance', gems: 20, check: () => this.raceStats.backwardsDistance >= 500 },
            'backwards_2000': { name: 'Reverse King', desc: 'Drive backwards for 2000 units of distance', gems: 60, check: () => this.raceStats.backwardsDistance >= 2000 },
            'perfect_race_1': { name: 'Flawless Victory', desc: 'Win a race leading every lap', gems: 25, check: () => this.raceStats.perfectRaces >= 1 },
            'perfect_race_5': { name: 'Dominator', desc: 'Win 5 races leading every lap', gems: 75, check: () => this.raceStats.perfectRaces >= 5 },
            'collector_1000': { name: 'Coin Magnet', desc: 'Collect 1000 coins', gems: 25, check: () => this.raceStats.coinsCollected >= 1000 },
            'collector_5000': { name: 'Coin Hoarder', desc: 'Collect 5000 coins', gems: 75, check: () => this.raceStats.coinsCollected >= 5000 },
            'boost_maniac_250': { name: 'Boost Junkie', desc: 'Use boost 250 times', gems: 30, check: () => this.raceStats.boostsUsed >= 250 },
            'boost_maniac_500': { name: 'Need for Speed', desc: 'Use boost 500 times', gems: 60, check: () => this.raceStats.boostsUsed >= 500 },
            'long_journey_25000': { name: 'Road Trippin\'', desc: 'Travel 25,000 units', gems: 40, check: () => this.raceStats.distanceTraveled >= 25000 },
            'long_journey_100000': { name: 'Globe Trotter', desc: 'Travel 100,000 units', gems: 120, check: () => this.raceStats.distanceTraveled >= 100000 },
            'race_enthusiast_100': { name: 'Race Enthusiast', desc: 'Complete 100 races', gems: 150, check: () => this.raceStats.totalRaces >= 100 },
            'win_master_100': { name: 'Win Master', desc: 'Win 100 races', gems: 300, check: () => this.raceStats.wins >= 100 },
            'gem_master_250': { name: 'Gem Tycoon', desc: 'Collect 250 gems', gems: 80, check: () => this.playerGems >= 250 },
            'gem_master_1000': { name: 'Gemperor', desc: 'Collect 1000 gems', gems: 250, check: () => this.playerGems >= 1000 },
            'unlock_all_evolved': { name: 'Evolution Complete', desc: 'Unlock all evolved vehicles', gems: 200, check: () => Object.keys(this.unlockedEvolvedVehicles).length >= 11 },
            'all_upgrades': { name: 'Maxed Out', desc: 'Purchase all vehicle and boost upgrades', gems: 150, check: () => this.boostUpgrades >= 5 && Object.keys(this.vehicleUpgrades).length >= 3 },
            'win_with_car': { name: 'Classic Win', desc: 'Win a race with the default car', gems: 10, check: () => this.raceStats.wins_car >= 1 },
            'win_with_aeroplane': { name: 'A-10 Warthog', desc: 'Win a race with the aeroplane', gems: 10, check: () => this.raceStats.wins_aeroplane >= 1 },
            'win_with_ufo': { name: 'Alien Overlord', desc: 'Win a race with the UFO', gems: 10, check: () => this.raceStats.wins_ufo >= 1 },
            'win_with_toilet': { name: 'Porcelain God', desc: 'Win a race with the toilet', gems: 10, check: () => this.raceStats.wins_toilet >= 1 },
            'win_with_tposing': { name: 'Asserting Dominance', desc: 'Win a race with the T-posing man', gems: 10, check: () => this.raceStats.wins_tposing >= 1 },
            'win_with_hyperchair': { name: 'Office Champion', desc: 'Win a race with the hyperchair', gems: 10, check: () => this.raceStats.wins_hyperchair >= 1 },
            'win_with_electriccar': { name: 'Future is Now', desc: 'Win a race with the electric car', gems: 10, check: () => this.raceStats.wins_electriccar >= 1 },
            'win_with_shoppingcart': { name: 'Cleanup on Aisle 3', desc: 'Win a race with the shopping cart', gems: 10, check: () => this.raceStats.wins_shoppingcart >= 1 },
            'win_with_duckhorse': { name: 'Quackallop', desc: 'Win a race with the duck horse', gems: 10, check: () => this.raceStats.wins_duckhorse >= 1 },
            'win_with_rocket': { name: 'To the Moon!', desc: 'Win a race with the rocket', gems: 10, check: () => this.raceStats.wins_rocket >= 1 },
            'win_with_shopvehicle': { name: 'Consumerism', desc: 'Win a race with the shop vehicle', gems: 10, check: () => this.raceStats.wins_shopvehicle >= 1 },
            'win_with_walkingcooler': { name: 'Ice Cold', desc: 'Win a race with the walking cooler', gems: 10, check: () => this.raceStats.wins_walkingcooler >= 1 },
            'first_gem': { name: 'Shiny!', desc: 'Earn your first gem', gems: 5, check: () => this.playerGems > 0 },
            'first_upgrade': { name: 'Tinkerer', desc: 'Buy your first upgrade', gems: 10, check: () => Object.keys(this.vehicleUpgrades).length > 0 || this.boostUpgrades > 0 },
            'first_evolved': { name: 'Next Level', desc: 'Unlock your first evolved vehicle', gems: 20, check: () => Object.keys(this.unlockedEvolvedVehicles).length > 0 },
            'close_call': { name: 'Photo Finish', desc: 'Win a race by less than a second', gems: 30, check: () => this.raceStats.closeFinishes > 0 },
            'no_boost_win': { name: 'Natural Talent', desc: 'Win a race without using boost', gems: 50, check: () => this.raceStats.wins_no_boost > 0 },
            'lap_opponent': { name: 'Lapped!', desc: 'Lap an opponent in a race', gems: 25, check: () => this.raceStats.laps_led > this.maxLaps },
            '10k_coins': { name: 'High Roller', desc: 'Have 10,000 coins at once', gems: 50, check: () => this.playerCoins >= 10000 },
            '500_gems': { name: 'Gemstone Collector', desc: 'Have 500 gems at once', gems: 100, check: () => this.playerGems >= 500 },
            'all_achievements': { name: 'Completionist', desc: 'Unlock all other achievements', gems: 500, check: () => Object.keys(this.achievements).length >= 99 },
            'race_5_times': { name: 'Just Getting Started', desc: 'Complete 5 races.', gems: 5, check: () => this.raceStats.totalRaces >= 5 },
            'race_10_times': { name: 'Warming Up', desc: 'Complete 10 races.', gems: 10, check: () => this.raceStats.totalRaces >= 10 },
            'win_2_times': { name: 'Twice as Nice', desc: 'Win 2 races.', gems: 10, check: () => this.raceStats.wins >= 2 },
            'coins_100': { name: 'Pocket Change', desc: 'Collect 100 coins total.', gems: 5, check: () => this.raceStats.coinsCollected >= 100 },
            'boost_25': { name: 'Booster', desc: 'Use boost 25 times.', gems: 10, check: () => this.raceStats.boostsUsed >= 25 },
            'travel_1000': { name: 'On the Road', desc: 'Travel 1,000 units.', gems: 10, check: () => this.raceStats.distanceTraveled >= 1000 },
            'crash_5': { name: 'Fender Bender', desc: 'Crash 5 times.', gems: 2, check: () => this.raceStats.totalCrashes >= 5 },
            'air_5': { name: 'Got Air?', desc: 'Get 5 seconds of air time.', gems: 5, check: () => this.raceStats.totalAirTime >= 5 },
            'backwards_100': { name: 'Moonwalker', desc: 'Drive backwards for 100 units.', gems: 5, check: () => this.raceStats.backwardsDistance >= 100 },
            'one_lap': { name: 'Lap One Complete', desc: 'Complete one lap.', gems: 2, check: () => this.currentLap > 1 },
            'one_gem': { name: 'My Precious', desc: 'Get one gem.', gems: 1, check: () => this.playerGems >= 1 },
            'ten_gems': { name: 'Gem Enthusiast', desc: 'Get 10 gems.', gems: 5, check: () => this.playerGems >= 10 },
            'win_streak_2': { name: 'Two in a Row', desc: 'Win 2 races in a row.', gems: 15, check: () => this.raceStats.winningStreak >= 2 },
            'no_crash_1': { name: 'Clean Lap', desc: 'Finish a race without crashing.', gems: 20, check: () => this.raceStats.racesWithoutCrashing >= 1 },
            'perfect_lap': { name: 'Perfect Lap', desc: 'Lead a lap from start to finish.', gems: 10, check: () => this.raceStats.lapsLed >= 1 },
            'coins_250': { name: 'Getting Richer', desc: 'Collect 250 coins.', gems: 10, check: () => this.raceStats.coinsCollected >= 250 },
            'boost_50': { name: 'Boost-happy', desc: 'Use boost 50 times.', gems: 15, check: () => this.raceStats.boostsUsed >= 50 },
            'travel_5000': { name: 'Road Warrior', desc: 'Travel 5,000 units.', gems: 20, check: () => this.raceStats.distanceTraveled >= 5000 },
            'crash_25': { name: 'Serious about Crashing', desc: 'Crash 25 times.', gems: 10, check: () => this.raceStats.totalCrashes >= 25 },
            'air_15': { name: 'Eagle Eye', desc: 'Get 15 seconds of air time.', gems: 10, check: () => this.raceStats.totalAirTime >= 15 },
            'backwards_250': { name: 'Wrong Way', desc: 'Drive backwards for 250 units.', gems: 10, check: () => this.raceStats.backwardsDistance >= 250 },
            'unlock_vehicle': { name: 'New Ride', desc: 'Unlock a new vehicle.', gems: 10, check: () => Object.keys(this.unlockedEvolvedVehicles).length > 0 },
            'buy_speed': { name: 'Speed Freak', desc: 'Buy a speed upgrade.', gems: 5, check: () => this.vehicleUpgrades.speed > 0 },
            'buy_accel': { name: 'Quick Start', desc: 'Buy an acceleration upgrade.', gems: 5, check: () => this.vehicleUpgrades.acceleration > 0 },
            'buy_turning': { name: 'Corner Master', desc: 'Buy a turning upgrade.', gems: 5, check: () => this.vehicleUpgrades.turning > 0 },
        };
        
        Object.entries(achievementDefinitions).forEach(([id, achievement]) => {
            const isUnlocked = this.achievements[id];
            const canUnlock = achievement.check();
            
            const achievementDiv = document.createElement('div');
            achievementDiv.style.cssText = `
                padding: 20px; 
                background: ${isUnlocked ? 'rgba(0,150,0,0.3)' : (canUnlock ? 'rgba(255,215,0,0.3)' : 'rgba(100,100,100,0.3)')}; 
                border-radius: 10px; 
                border: 2px solid ${isUnlocked ? '#00aa00' : (canUnlock ? '#FFD700' : '#666')}; 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
            `;
            
            achievementDiv.innerHTML = `
                <div>
                    <h3 style="margin: 0; color: ${isUnlocked ? '#00ff00' : (canUnlock ? '#FFD700' : '#aaa')}">${isUnlocked ? '🏆' : (canUnlock ? '⭐' : '🔒')} ${achievement.name}</h3>
                    <p style="margin: 5px 0; font-size: 14px;">${achievement.desc}</p>
                    <div style="font-size: 12px; color: #aaa;">
                        Progress: ${this.getAchievementProgress(id, achievement)}
                    </div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px;">${isUnlocked ? '✅' : '💎'}</div>
                    <div style="font-weight: bold; color: #9900ff;">${achievement.gems} gems</div>
                    <div style="font-size: 12px;">${isUnlocked ? 'EARNED' : (canUnlock ? 'READY!' : 'LOCKED')}</div>
                </div>
            `;
            
            achievementsList.appendChild(achievementDiv);
        });
    }
    
    getAchievementProgress(id, achievement) {
        switch(id) {
            case 'first_race':
            case 'race_veteran':
            case 'ultimate_racer':
                return `${this.raceStats.totalRaces} races completed`;
            case 'speed_demon':
            case 'champion':
            case 'legendary':
                return `${this.raceStats.wins} races won`;
            case 'coin_collector':
                return `${this.raceStats.coinsCollected} coins collected`;
            case 'boost_master':
                return `${this.raceStats.boostsUsed} boosts used`;
            case 'marathon_runner':
                return `${Math.round(this.raceStats.distanceTraveled)} distance traveled`;
            case 'gem_hunter':
                return `${this.playerGems} gems collected`;
            default:
                return 'In progress...';
        }
    }
    
    createEnvironment() {
        // DRASTICALLY REDUCED for performance - 12 trees instead of 80
        for (let i = 0; i < 12; i++) {
            this.createTree(
                (Math.random() - 0.5) * 400, // Smaller area
                (Math.random() - 0.5) * 400
            );
        }
        
        // DRASTICALLY REDUCED for performance - 6 clouds instead of 30
        for (let i = 0; i < 6; i++) {
            this.createCloud(
                (Math.random() - 0.5) * 400, // Smaller area
                30 + Math.random() * 30, // Higher and less variation
                (Math.random() - 0.5) * 400
            );
        }
        
        console.log('🌲 Environment optimized for performance! (12 trees, 6 clouds)');
    }
    
    createTree(x, z) {
        // Avoid placing trees on the massive circular loop track
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        if (distanceFromCenter < this.outerRadius + 20 && distanceFromCenter > this.innerRadius - 20) return; // Avoid track area
        
        // Tree trunk - OPTIMIZED
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 4, z);
        trunk.castShadow = false; // DISABLED for performance
        this.scene.add(trunk);
        
        // Tree foliage - OPTIMIZED
        const foliageGeometry = new THREE.SphereGeometry(4);
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 10, z);
        foliage.castShadow = false; // DISABLED for performance
        this.scene.add(foliage);
    }
    
    createCloud(x, y, z) {
        const cloudGeometry = new THREE.SphereGeometry(5);
        const cloudMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(x, y, z);
        cloud.scale.set(
            1 + Math.random(),
            0.5 + Math.random() * 0.5,
            1 + Math.random()
        );
        this.scene.add(cloud);
    }
    
    createCar() {
        // Create car group
        this.car = new THREE.Group();
        
        // Car body (main chassis)
        const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        this.car.add(body);
        
        // Car roof
        const roofGeometry = new THREE.BoxGeometry(3, 1, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xcc0000,
            shininess: 80
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 2, -1);
        roof.castShadow = true;
        this.car.add(roof);
        
        // Car hood
        const hoodGeometry = new THREE.BoxGeometry(3.5, 0.3, 3);
        const hoodMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 1.8, 2.5);
        hood.castShadow = true;
        this.car.add(hood);
        
        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(2.8, 0.8, 0.1);
        const windshieldMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 2.3, 1);
        this.car.add(windshield);
        
        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.3);
        const headlightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffcc,
            emissive: 0x444400
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-1.5, 1.2, 4);
        this.car.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(1.5, 1.2, 4);
        this.car.add(rightHeadlight);
        
        // Create wheels
        this.createWheels();
        
        // Position car at start of massive loop track
        this.car.position.set(this.trackRadius, 2, 0); // Start position based on selected circuit
        this.scene.add(this.car);
    }
    
    createAICar() {
        // Create AI car group
        this.aiCar = new THREE.Group();
        
        // AI Car body (main chassis) - Blue color
        const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0066ff,
            shininess: 100
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        this.aiCar.add(body);
        
        // AI Car roof
        const roofGeometry = new THREE.BoxGeometry(3, 1, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0044cc,
            shininess: 80
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 2, -1);
        roof.castShadow = true;
        this.aiCar.add(roof);
        
        // AI Car hood
        const hoodGeometry = new THREE.BoxGeometry(3.5, 0.3, 3);
        const hoodMaterial = new THREE.MeshPhongMaterial({ color: 0x0066ff });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 1.8, 2.5);
        hood.castShadow = true;
        this.aiCar.add(hood);
        
        // AI Windshield
        const windshieldGeometry = new THREE.BoxGeometry(2.8, 0.8, 0.1);
        const windshieldMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 2.3, 1);
        this.aiCar.add(windshield);
        
        // AI Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.3);
        const headlightMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffcc,
            emissive: 0x444400
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-1.5, 1.2, 4);
        this.aiCar.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(1.5, 1.2, 4);
        this.aiCar.add(rightHeadlight);
        
        // Create AI wheels
        this.createAIWheels();
        
        // Position AI car at start (slightly behind player)
        this.aiCar.position.set(150, 2, 20); // Start behind player on massive track
        this.aiCarAngle = Math.atan2(20, 150); // Set initial angle based on position
        this.scene.add(this.aiCar);
    }
    
    createAIWheels() {
        const wheelPositions = [
            { x: -2, z: 3 },   // Front left
            { x: 2, z: 3 },    // Front right
            { x: -2, z: -3 },  // Rear left
            { x: 2, z: -3 }    // Rear right
        ];
        
        wheelPositions.forEach(pos => {
            // Create wheel group
            const wheelGroup = new THREE.Group();
            
            // Tire
            const tireGeometry = new THREE.CylinderGeometry(1, 1, 0.6);
            const tireMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelGroup.add(tire);
            
            // Rim
            const rimGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.7);
            const rimMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xcccccc,
                shininess: 100
            });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);
            
            // Hub cap
            const hubGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8);
            const hubMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x888888,
                shininess: 80
            });
            const hub = new THREE.Mesh(hubGeometry, hubMaterial);
            hub.rotation.z = Math.PI / 2;
            wheelGroup.add(hub);
            
            wheelGroup.position.set(pos.x, 0.5, pos.z);
            this.aiCar.add(wheelGroup);
        });
    }
    
    createWheels() {
        const wheelPositions = [
            { x: -2, z: 3 },   // Front left
            { x: 2, z: 3 },    // Front right
            { x: -2, z: -3 },  // Rear left
            { x: 2, z: -3 }    // Rear right
        ];
        
        wheelPositions.forEach(pos => {
            // Create wheel group
            const wheelGroup = new THREE.Group();
            
            // Tire
            const tireGeometry = new THREE.CylinderGeometry(1, 1, 0.6);
            const tireMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelGroup.add(tire);
            
            // Rim
            const rimGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.7);
            const rimMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xcccccc,
                shininess: 100
            });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);
            
            // Hub cap
            const hubGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8);
            const hubMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x888888,
                shininess: 80
            });
            const hub = new THREE.Mesh(hubGeometry, hubMaterial);
            hub.rotation.z = Math.PI / 2;
            wheelGroup.add(hub);
            
            wheelGroup.position.set(pos.x, 0.5, pos.z);
            this.car.add(wheelGroup);
        });
    }
    
    createMultipleAICars() {
        // REDUCED to 2 AI cars for performance
        const aiColors = [0x0066ff, 0xff6600];
        const aiVehicleTypes = ['car', 'ufo']; // Aeroplane removed
        
        // ALL AI cars use the SAME track radius as checkpoints (dynamic)
        const trackRadius = this.trackRadius;
        const startAngles = [
            Math.PI * 0.3,   // Blue car - 30% around track
            Math.PI * 0.7    // Orange aeroplane - 70% around track
        ];
        
        this.aiCars = [];
        this.aiCarsData = [];
        
        for(let i = 0; i < 2; i++) { // REDUCED from 4 to 2
            // Calculate starting position on the track
            const startX = Math.cos(startAngles[i]) * trackRadius;
            const startZ = Math.sin(startAngles[i]) * trackRadius;
            
            const aiCar = this.createVehicle(aiVehicleTypes[i], aiColors[i]);
            aiCar.position.set(startX, 2, startZ);
            this.scene.add(aiCar);
            this.aiCars.push(aiCar);
            
            this.aiCarsData.push({
                speed: 0.4 + Math.random() * 0.1, // Much faster AI base speed
                angle: startAngles[i],
                trackRadius: trackRadius, // ALL on same track as checkpoints!
                currentLap: 1,
                lastCheckpoint: 0,
                vehicleType: aiVehicleTypes[i]
            });
        }
        
        console.log('🤖 Created 2 AI opponents! (OPTIMIZED FOR PERFORMANCE)');
    }
    
    createVehicle(vehicleType, color = 0xff0000) {
        const vehicle = new THREE.Group();
        
        switch(vehicleType) {
            case 'car':
                return this.createCarModel(vehicle, color);
            case 'ufo':
                return this.createUFOModel(vehicle, color);
            case 'toilet':
                return this.createToiletModel(vehicle, color);
            case 'tposing':
                return this.createTPosingManModel(vehicle, color);
            case 'hyperchair':
                return this.createHyperChairModel(vehicle, color);
            case 'electriccar':
                return this.createElectricCarModel(vehicle, color);
            case 'shoppingcart':
                return this.createShoppingCartModel(vehicle, color);
            case 'duckhorse':
                return this.createDuckHorseModel(vehicle, color);
            case 'rocket':
                return this.createRocketModel(vehicle, color);
            case 'shopvehicle':
                return this.createShopVehicleModel(vehicle, color);
            case 'walkingcooler':
                return this.createWalkingCoolerModel(vehicle, color);
            // 🔥 EVOLVED VEHICLES 🔥
            case 'evolved_car':
                return this.createEvolvedCarModel(vehicle, color);
            case 'evolved_ufo':
                return this.createEvolvedUFOModel(vehicle, color);
            case 'evolved_toilet':
                return this.createEvolvedCarModel(vehicle, color);
            case 'evolved_tposing':
                return this.createEvolvedCarModel(vehicle, color);
            case 'evolved_hyperchair':
                return this.createEvolvedCarModel(vehicle, color);
            case 'evolved_electriccar':
                return this.createEvolvedCarModel(vehicle, color);
            case 'evolved_shoppingcart':
                return this.createEvolvedCarModel(vehicle, color);
            case 'evolved_duckhorse':
                return this.createEvolvedCarModel(vehicle, color);
            case 'evolved_rocket':
                return this.createEvolvedRocketModel(vehicle, color);
            // Fallback for any evolved models not yet implemented
            default:
                console.warn(`Model for ${vehicleType} not implemented, falling back to default car model.`);
                return this.createCarModel(vehicle, color);
        }
    }
    
    createCarModel(vehicle, color) {
        // Car body - OPTIMIZED MATERIALS
        const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color }); // CHANGED from Phong for performance
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = false; // DISABLED for performance
        vehicle.add(body);
        
        // Add wheels only for cars
        this.addWheelsToVehicle(vehicle);
        return vehicle;
    }
    
    createAeroplaneModel(vehicle, color) {
        // Fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(1, 2, 12);
        const fuselage = new THREE.Mesh(fuselageGeometry, new THREE.MeshPhongMaterial({ color: color }));
        fuselage.rotation.z = Math.PI / 2;
        fuselage.position.y = 3;
        fuselage.castShadow = true;
        vehicle.add(fuselage);
        
        // Main wings (left & right)
        const wingMaterial = new THREE.MeshPhongMaterial({ color: color });
        const wingGeom = new THREE.BoxGeometry(6, 0.3, 1.5);

        const leftWing = new THREE.Mesh(wingGeom, wingMaterial);
        leftWing.position.set(-3, 3, 0);
        leftWing.rotation.z = Math.PI / 18; // slight upward tilt (dihedral)
        leftWing.castShadow = true;
        vehicle.add(leftWing);

        const rightWing = leftWing.clone();
        rightWing.position.x = 3;
        rightWing.rotation.z = -Math.PI / 18;
        vehicle.add(rightWing);

        // Tail horizontal stabilizer
        const tailWingGeom = new THREE.BoxGeometry(3, 0.2, 1);
        const tailWing = new THREE.Mesh(tailWingGeom, wingMaterial);
        tailWing.position.set(5, 3, 0);
        tailWing.castShadow = true;
        vehicle.add(tailWing);

        // Tail vertical stabilizer
        const tailFinGeom = new THREE.BoxGeometry(0.2, 1.2, 1);
        const tailFin = new THREE.Mesh(tailFinGeom, wingMaterial);
        tailFin.position.set(5.2, 3.8, 0);
        tailFin.castShadow = true;
        vehicle.add(tailFin);
        
        return vehicle;
    }
    
    createUFOModel(vehicle, color) {
        // Main disc
        const discGeometry = new THREE.CylinderGeometry(4, 4, 1);
        const disc = new THREE.Mesh(discGeometry, new THREE.MeshPhongMaterial({ 
            color: color, emissive: 0x003300 
        }));
        disc.position.y = 3;
        disc.castShadow = true;
        vehicle.add(disc);
        
        // Dome
        const domeGeometry = new THREE.SphereGeometry(2);
        const dome = new THREE.Mesh(domeGeometry, new THREE.MeshPhongMaterial({ 
            color: 0x87CEEB, transparent: true, opacity: 0.6 
        }));
        dome.position.y = 4;
        dome.scale.y = 0.5;
        vehicle.add(dome);
        
        return vehicle;
    }
    
    createToiletModel(vehicle, color) {
        // Bowl
        const bowlGeometry = new THREE.CylinderGeometry(2, 2.5, 2);
        const bowl = new THREE.Mesh(bowlGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        bowl.position.y = 2;
        bowl.castShadow = true;
        vehicle.add(bowl);
        
        // Tank
        const tankGeometry = new THREE.BoxGeometry(3, 3, 1);
        const tank = new THREE.Mesh(tankGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        tank.position.set(0, 4, -2);
        tank.castShadow = true;
        vehicle.add(tank);
        
        return vehicle;
    }
    
    createTPosingManModel(vehicle, color) {
        // Body
        const bodyGeometry = new THREE.BoxGeometry(2, 4, 1);
        const body = new THREE.Mesh(bodyGeometry, new THREE.MeshPhongMaterial({ color: color }));
        body.position.y = 3;
        body.castShadow = true;
        vehicle.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.8);
        const head = new THREE.Mesh(headGeometry, new THREE.MeshPhongMaterial({ color: 0xffdbac }));
        head.position.y = 5.5;
        head.castShadow = true;
        vehicle.add(head);
        
        // Arms (T-pose!)
        const armGeometry = new THREE.BoxGeometry(6, 1, 1);
        const arms = new THREE.Mesh(armGeometry, new THREE.MeshPhongMaterial({ color: color }));
        arms.position.y = 4;
        arms.castShadow = true;
        vehicle.add(arms);
        
        return vehicle;
    }
    
    createHyperChairModel(vehicle, color) {
        // Chair seat
        const seatGeometry = new THREE.BoxGeometry(3, 0.5, 3);
        const seat = new THREE.Mesh(seatGeometry, new THREE.MeshPhongMaterial({ 
            color: color, emissive: 0x001122 
        }));
        seat.position.y = 2;
        seat.castShadow = true;
        vehicle.add(seat);
        
        // Energy field
        const fieldGeometry = new THREE.SphereGeometry(4);
        const field = new THREE.Mesh(fieldGeometry, new THREE.MeshPhongMaterial({ 
            color: 0x0088ff, transparent: true, opacity: 0.2, emissive: 0x002244 
        }));
        field.position.y = 2;
        vehicle.add(field);
        
        return vehicle;
    }
    
    createElectricCarModel(vehicle, color) {
        // Car body (similar to car but more futuristic)
        const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: color, 
            shininess: 200,
            emissive: 0x001100  // Green electric glow
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        vehicle.add(body);
        
        // Electric charging port
        const portGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5);
        const port = new THREE.Mesh(portGeometry, new THREE.MeshPhongMaterial({ 
            color: 0x00ff00, emissive: 0x002200 
        }));
        port.position.set(-1.5, 2, 2);
        port.rotation.z = Math.PI / 2;
        vehicle.add(port);
        
        // Lightning bolt decoration
        const boltGeometry = new THREE.BoxGeometry(0.5, 2, 0.1);
        const bolt = new THREE.Mesh(boltGeometry, new THREE.MeshPhongMaterial({ 
            color: 0xffff00, emissive: 0x333300 
        }));
        bolt.position.set(0, 2, 4);
        vehicle.add(bolt);
        
        // Add wheels
        this.addWheelsToVehicle(vehicle);
        return vehicle;
    }
    
    createShoppingCartModel(vehicle, color) {
        // Cart basket (wire frame style)
        const basketGeometry = new THREE.BoxGeometry(3, 2, 4);
        const basketMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x888888, 
            wireframe: true 
        });
        const basket = new THREE.Mesh(basketGeometry, basketMaterial);
        basket.position.y = 2;
        basket.castShadow = true;
        vehicle.add(basket);
        
        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3);
        const handle = new THREE.Mesh(handleGeometry, new THREE.MeshPhongMaterial({ color: 0x666666 }));
        handle.position.set(0, 3.5, -3);
        handle.rotation.x = Math.PI / 6; // Slight angle
        handle.castShadow = true;
        vehicle.add(handle);
        
        // Shopping items in cart
        const itemGeometry = new THREE.BoxGeometry(1, 1, 1);
        const items = [
            { pos: [-0.5, 2.5, 0], color: 0xff0000 },  // Red item
            { pos: [0.5, 2.5, 1], color: 0x00ff00 },   // Green item
            { pos: [0, 2.5, -1], color: 0x0000ff }     // Blue item
        ];
        
        items.forEach(item => {
            const itemMesh = new THREE.Mesh(itemGeometry, new THREE.MeshPhongMaterial({ color: item.color }));
            itemMesh.position.set(...item.pos);
            vehicle.add(itemMesh);
        });
        
        // Add wheels (shopping cart wheels are smaller)
        const wheelPositions = [
            { x: -1, z: 2 }, { x: 1, z: 2 }, { x: -1, z: -2 }, { x: 1, z: -2 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group();
            const tire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.3),
                new THREE.MeshPhongMaterial({ color: 0x222222 })
            );
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelGroup.add(tire);
            wheelGroup.position.set(pos.x, 0.3, pos.z);
            vehicle.add(wheelGroup);
        });
        
        return vehicle;
    }
    
    createDuckHorseModel(vehicle, color) {
        // Horse body
        const horseBodyGeometry = new THREE.BoxGeometry(6, 3, 2);
        const horseBody = new THREE.Mesh(horseBodyGeometry, new THREE.MeshPhongMaterial({ color: 0x8B4513 })); // Brown
        horseBody.position.y = 2;
        horseBody.castShadow = true;
        vehicle.add(horseBody);
        
        // Duck head
        const duckHeadGeometry = new THREE.SphereGeometry(1.5);
        const duckHead = new THREE.Mesh(duckHeadGeometry, new THREE.MeshPhongMaterial({ color: 0xFFD700 })); // Golden yellow
        duckHead.position.set(0, 3, 4);
        duckHead.scale.set(1, 0.8, 1.2); // Duck-like proportions
        duckHead.castShadow = true;
        vehicle.add(duckHead);
        
        // Duck bill
        const billGeometry = new THREE.ConeGeometry(0.5, 1);
        const bill = new THREE.Mesh(billGeometry, new THREE.MeshPhongMaterial({ color: 0xFFA500 })); // Orange
        bill.position.set(0, 2.5, 5);
        bill.rotation.x = Math.PI / 2;
        bill.castShadow = true;
        vehicle.add(bill);
        
        // Human legs (standing upright)
        const legGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3);
        const leftLeg = new THREE.Mesh(legGeometry, new THREE.MeshPhongMaterial({ color: 0xffdbac })); // Skin color
        leftLeg.position.set(-1, 0, 0);
        leftLeg.castShadow = true;
        vehicle.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, new THREE.MeshPhongMaterial({ color: 0xffdbac }));
        rightLeg.position.set(1, 0, 0);
        rightLeg.castShadow = true;
        vehicle.add(rightLeg);
        
        // Chimpanzee arms (long and hanging)
        const armGeometry = new THREE.CylinderGeometry(0.4, 0.4, 4);
        const leftArm = new THREE.Mesh(armGeometry, new THREE.MeshPhongMaterial({ color: 0x654321 })); // Dark brown
        leftArm.position.set(-2.5, 2, 1);
        leftArm.rotation.z = Math.PI / 6; // Angled downward
        leftArm.castShadow = true;
        vehicle.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, new THREE.MeshPhongMaterial({ color: 0x654321 }));
        rightArm.position.set(2.5, 2, 1);
        rightArm.rotation.z = -Math.PI / 6; // Angled downward
        rightArm.castShadow = true;
        vehicle.add(rightArm);
        
        // Horse tail
        const tailGeometry = new THREE.ConeGeometry(0.3, 2);
        const tail = new THREE.Mesh(tailGeometry, new THREE.MeshPhongMaterial({ color: 0x654321 }));
        tail.position.set(0, 2.5, -4);
        tail.rotation.x = Math.PI / 4; // Angled back
        tail.castShadow = true;
        vehicle.add(tail);
        
        // Don't add normal wheels - this creature runs on its human legs!
        return vehicle;
    }
    
    createRocketModel(vehicle, color) {
        // Main rocket body
        const rocketBodyGeometry = new THREE.ConeGeometry(1.5, 8);
        const rocketBody = new THREE.Mesh(rocketBodyGeometry, new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 200,
            emissive: 0x220022
        }));
        rocketBody.position.y = 4;
        rocketBody.castShadow = true;
        vehicle.add(rocketBody);
        
        // Rocket fins
        const finGeometry = new THREE.BoxGeometry(0.5, 3, 2);
        const finMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
        
        for (let i = 0; i < 4; i++) {
            const fin = new THREE.Mesh(finGeometry, finMaterial);
            const angle = (i / 4) * Math.PI * 2;
            fin.position.set(
                Math.cos(angle) * 1.2,
                1.5,
                Math.sin(angle) * 1.2
            );
            fin.rotation.y = angle;
            fin.castShadow = true;
            vehicle.add(fin);
        }
        
        // Rocket exhaust flames (visual effect)
        const flameGeometry = new THREE.ConeGeometry(1, 3);
        const flameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff3300,
            transparent: true,
            opacity: 0.8
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = -1;
        flame.rotation.x = Math.PI; // Point downward
        vehicle.add(flame);
        
        // Add rocket thrusters instead of wheels
        const thrusterGeometry = new THREE.CylinderGeometry(0.5, 0.3, 1);
        const thrusterMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            emissive: 0x110011
        });
        
        const thrusterPositions = [
            { x: -1.5, z: 1.5 }, { x: 1.5, z: 1.5 }, 
            { x: -1.5, z: -1.5 }, { x: 1.5, z: -1.5 }
        ];
        
        thrusterPositions.forEach(pos => {
            const thruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
            thruster.position.set(pos.x, 0.5, pos.z);
            vehicle.add(thruster);
        });
        
        return vehicle;
    }
    
    createShopVehicleModel(vehicle, color) {
        // Mobile shop base (like a food truck)
        const baseGeometry = new THREE.BoxGeometry(5, 3, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 50
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 2;
        base.castShadow = true;
        vehicle.add(base);
        
        // Shop window/counter
        const windowGeometry = new THREE.BoxGeometry(4, 1.5, 0.2);
        const windowMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.8
        });
        const shopWindow = new THREE.Mesh(windowGeometry, windowMaterial);
        shopWindow.position.set(0, 2.5, 4);
        vehicle.add(shopWindow);
        
        // Shop sign
        const signGeometry = new THREE.BoxGeometry(3, 1, 0.1);
        const signMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 4.5, 4);
        vehicle.add(sign);
        
        // Shop items on top
        const itemGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const itemColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        
        for (let i = 0; i < 5; i++) {
            const item = new THREE.Mesh(itemGeometry, new THREE.MeshPhongMaterial({ 
                color: itemColors[i] 
            }));
            item.position.set(
                (i - 2) * 1.2,
                4,
                -2 + (i % 2) * 1
            );
            vehicle.add(item);
        }
        
        // Cash register
        const registerGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
        const register = new THREE.Mesh(registerGeometry, new THREE.MeshPhongMaterial({ color: 0x333333 }));
        register.position.set(0, 3.5, 2);
        vehicle.add(register);
        
        // Add wheels like a normal vehicle
        this.addWheelsToVehicle(vehicle);
        
        return vehicle;
    }
    
    createWalkingCoolerModel(vehicle, color) {
        // Main cooler body
        const coolerGeometry = new THREE.BoxGeometry(3, 4, 2);
        const coolerMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87CEEB, // Light blue
            transparent: false
        });
        const cooler = new THREE.Mesh(coolerGeometry, coolerMaterial);
        cooler.position.y = 2;
        vehicle.add(cooler);
        
        // Cooler handle
        const handleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.5);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, 4.5, 0);
        handle.rotation.z = Math.PI / 2;
        vehicle.add(handle);
        
        // Walking legs (4 robotic legs)
        for (let i = 0; i < 4; i++) {
            const legGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3);
            const legMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            
            const angle = (i / 4) * Math.PI * 2;
            leg.position.set(
                Math.cos(angle) * 1.2,
                0.5,
                Math.sin(angle) * 0.8
            );
            leg.userData = { originalY: 0.5, walkPhase: i * Math.PI / 2 };
            vehicle.add(leg);
        }
        
        // Ice cube window
        const windowGeometry = new THREE.BoxGeometry(2, 2, 0.1);
        const windowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.8 
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(0, 2, 1.1);
        vehicle.add(window);
        
        // Cooling vents
        for (let i = 0; i < 3; i++) {
            const ventGeometry = new THREE.BoxGeometry(2.5, 0.2, 0.1);
            const vent = new THREE.Mesh(ventGeometry, new THREE.MeshLambertMaterial({ color: 0x333333 }));
            vent.position.set(0, 0.5 + i * 0.8, 1.1);
            vehicle.add(vent);
        }
        
        return vehicle;
    }
    
    // 🔥 EVOLVED VEHICLE MODELS 🔥
    createEvolvedCarModel(vehicle, color) {
        // MEGA EVOLVED CAR - Futuristic supercar
        const bodyGeometry = new THREE.BoxGeometry(4.5, 1.8, 9);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: color,
            emissive: new THREE.Color(color).multiplyScalar(0.3) // Glowing effect
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2;
        vehicle.add(body);
        
        // Spoiler
        const spoilerGeometry = new THREE.BoxGeometry(4, 0.5, 1);
        const spoiler = new THREE.Mesh(spoilerGeometry, bodyMaterial);
        spoiler.position.set(0, 3, -4);
        vehicle.add(spoiler);
        
        // Jet engines
        for (let i = 0; i < 2; i++) {
            const engineGeometry = new THREE.CylinderGeometry(0.8, 1, 2);
            const engine = new THREE.Mesh(engineGeometry, new THREE.MeshLambertMaterial({ color: 0x333333 }));
            engine.position.set(i === 0 ? -1.5 : 1.5, 1, -5);
            engine.rotation.x = Math.PI / 2;
            vehicle.add(engine);
            
            // Flame effect
            const flameGeometry = new THREE.ConeGeometry(0.6, 1.5);
            const flame = new THREE.Mesh(flameGeometry, new THREE.MeshBasicMaterial({ 
                color: 0xff3300, transparent: true, opacity: 0.8 
            }));
            flame.position.set(i === 0 ? -1.5 : 1.5, 1, -6.5);
            flame.rotation.x = Math.PI / 2;
            vehicle.add(flame);
        }
        
        this.addWheelsToVehicle(vehicle);
        return vehicle;
    }
    
    createEvolvedRocketModel(vehicle, color) {
        // OMEGA ROCKET - Massive space destroyer
        const rocketBodyGeometry = new THREE.ConeGeometry(2.5, 12);
        const rocketBody = new THREE.Mesh(rocketBodyGeometry, new THREE.MeshLambertMaterial({ 
            color: color,
            emissive: new THREE.Color(color).multiplyScalar(0.4)
        }));
        rocketBody.position.y = 6;
        vehicle.add(rocketBody);
        
        // Multiple rocket boosters
        for (let i = 0; i < 6; i++) {
            const boosterGeometry = new THREE.CylinderGeometry(0.8, 1.2, 4);
            const booster = new THREE.Mesh(boosterGeometry, new THREE.MeshLambertMaterial({ color: 0x666666 }));
            const angle = (i / 6) * Math.PI * 2;
            booster.position.set(
                Math.cos(angle) * 2.5,
                2,
                Math.sin(angle) * 2.5
            );
            vehicle.add(booster);
            
            // Massive flames
            const flameGeometry = new THREE.ConeGeometry(1, 4);
            const flame = new THREE.Mesh(flameGeometry, new THREE.MeshBasicMaterial({ 
                color: i % 2 === 0 ? 0xff3300 : 0x0066ff, transparent: true, opacity: 0.9 
            }));
            flame.position.set(
                Math.cos(angle) * 2.5,
                -1,
                Math.sin(angle) * 2.5
            );
            flame.rotation.x = Math.PI;
            vehicle.add(flame);
        }
        
        return vehicle;
    }
    
    createEvolvedUFOModel(vehicle, color) {
        // MOTHER SHIP UFO - Massive alien craft
        const discGeometry = new THREE.CylinderGeometry(6, 6, 1.5);
        const disc = new THREE.Mesh(discGeometry, new THREE.MeshLambertMaterial({ 
            color: color, 
            emissive: new THREE.Color(color).multiplyScalar(0.3)
        }));
        disc.position.y = 3;
        vehicle.add(disc);
        
        // Command dome
        const domeGeometry = new THREE.SphereGeometry(3);
        const dome = new THREE.Mesh(domeGeometry, new THREE.MeshLambertMaterial({ 
            color: 0x00ffff, transparent: true, opacity: 0.7 
        }));
        dome.position.y = 5;
        dome.scale.y = 0.6;
        vehicle.add(dome);
        
        // Energy rings
        for (let i = 0; i < 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(4 + i, 0.3, 8, 16);
            const ring = new THREE.Mesh(ringGeometry, new THREE.MeshLambertMaterial({ 
                color: 0x00ff00, transparent: true, opacity: 0.6 
            }));
            ring.position.y = 1 + i * 0.5;
            ring.rotation.x = Math.PI / 2;
            vehicle.add(ring);
        }
        
        return vehicle;
    }
    
    addWheelsToVehicle(vehicle) {
        const wheelPositions = [
            { x: -2, z: 3 }, { x: 2, z: 3 }, { x: -2, z: -3 }, { x: 2, z: -3 }
        ];
        
        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group();
            const tire = new THREE.Mesh(
                new THREE.CylinderGeometry(1, 1, 0.6),
                new THREE.MeshPhongMaterial({ color: 0x222222 })
            );
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelGroup.add(tire);
            wheelGroup.position.set(pos.x, 0.5, pos.z);
            vehicle.add(wheelGroup);
        });
    }
    
    recreatePlayerVehicle() {
        // Remove old vehicle
        if (this.car) {
            this.scene.remove(this.car);
        }
        
        // Create new vehicle based on selection
        this.car = this.createVehicle(this.selectedVehicle, 0xff0000);
        this.car.position.set(this.trackRadius, 2, 0); // Start position based on selected circuit
        this.scene.add(this.car);
        
        // Fishing line trail DISABLED for performance
        // this.createFishingLineTrail();
    }
    
    createFishingLineTrail() {
        // Create fishing line geometry for trail effect
        const trailGeometry = new THREE.BufferGeometry();
        const trailMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.6,
            linewidth: 3
        });
        
        this.fishingLine = new THREE.Line(trailGeometry, trailMaterial);
        this.scene.add(this.fishingLine);
        this.fishingLines = []; // Array to store trail points
    }
    
    getVehicleMultipliers() {
        const multipliers = {
            // 🚀 ORIGINAL VEHICLES - MASSIVELY BOOSTED! 🚀
            car: { maxSpeed: 1.5, acceleration: 1.4, turning: 1.2 },
            aeroplane: { maxSpeed: 2.0, acceleration: 1.2, turning: 0.9 },
            ufo: { maxSpeed: 1.8, acceleration: 1.6, turning: 1.6 },
            toilet: { maxSpeed: 1.2, acceleration: 1.8, turning: 1.3 },
            tposing: { maxSpeed: 1.4, acceleration: 1.3, turning: 1.8 },
            hyperchair: { maxSpeed: 2.4, acceleration: 1.8, turning: 1.5 },
            electriccar: { maxSpeed: 2.0, acceleration: 2.0, turning: 1.6 },
            shoppingcart: { maxSpeed: 4.5, acceleration: 2.0, turning: 2.2 }, // 🛒 ULTIMATE SPEED BEAST! 🛒
            duckhorse: { maxSpeed: 1.7, acceleration: 2.2, turning: 2.0 },
            rocket: { maxSpeed: 3.5, acceleration: 3.0, turning: 1.0 }, // 🚀 MEGA ROCKET POWER! 🚀
            shopvehicle: { maxSpeed: 1.3, acceleration: 1.4, turning: 1.5 }, // 🏪 Enhanced mobile shop
            walkingcooler: { maxSpeed: 1.0, acceleration: 1.1, turning: 2.5 }, // 🧊 Cool walking machine
            
            // 🔥 EVOLVED VEHICLES - LEGENDARY TIER! 🔥
            evolved_car: { maxSpeed: 5.0, acceleration: 4.0, turning: 2.0 }, // 🏎️ LEGENDARY SUPERCAR
            evolved_ufo: { maxSpeed: 5.5, acceleration: 4.5, turning: 3.0 }, // 🛸 MOTHER SHIP
            evolved_toilet: { maxSpeed: 3.5, acceleration: 3.0, turning: 2.8 }, // 🚽 GOLDEN THRONE
            evolved_tposing: { maxSpeed: 4.0, acceleration: 3.8, turning: 2.5 }, // 🧍 ULTIMATE POWER STANCE
            evolved_hyperchair: { maxSpeed: 7.0, acceleration: 5.0, turning: 3.5 }, // 🚀 COSMIC THRONE
            evolved_electriccar: { maxSpeed: 6.5, acceleration: 4.8, turning: 2.8 }, // ⚡ TESLA DESTROYER
            evolved_shoppingcart: { maxSpeed: 9.0, acceleration: 3.0, turning: 1.5 }, // 🛒 SHOPPING DESTROYER
            evolved_duckhorse: { maxSpeed: 5.0, acceleration: 4.2, turning: 4.0 }, // 🦆 MYTHICAL LEGEND
            evolved_rocket: { maxSpeed: 12.0, acceleration: 8.0, turning: 1.2 }, // 🚀 SPACE ANNIHILATOR
            evolved_walkingcooler: { maxSpeed: 4.0, acceleration: 3.0, turning: 5.0 } // 🧊 ARCTIC DESTROYER
        };
        
        // Apply permanent upgrades from shop
        const baseMultipliers = multipliers[this.selectedVehicle] || multipliers.car;
        const upgrades = this.vehicleUpgrades[this.selectedVehicle] || {};
        
        return {
            maxSpeed: baseMultipliers.maxSpeed + (upgrades.speed || 0),
            acceleration: baseMultipliers.acceleration + (upgrades.acceleration || 0),
            turning: baseMultipliers.turning + (upgrades.turning || 0)
        };
    }
    
    playBoostSound() {
        if (!this.audioInitialized) return;
        
        // Create a whoosh sound for boost
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    createBoostParticles() {
        if (!this.car) return;
        
        // Create simple particle effect for boost
        for(let i = 0; i < 3; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.5);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: Math.random() > 0.5 ? 0xff6600 : 0xffff00,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position behind car
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 4, 
                Math.random() * 2, 
                -(8 + Math.random() * 4)
            );
            offset.applyQuaternion(this.car.quaternion);
            particle.position.copy(this.car.position).add(offset);
            
            this.scene.add(particle);
            
            // Remove particle after short time
            setTimeout(() => {
                this.scene.remove(particle);
            }, 200);
        }
    }
    
    updateFishingLineTrail() {
        if (!this.car || !this.fishingLine) return;
        
        // Add current car position to trail
        this.fishingLines.push(this.car.position.clone());
        
        // Limit trail length
        if (this.fishingLines.length > 50) {
            this.fishingLines.shift();
        }
        
        // Update trail geometry
        const positions = [];
        this.fishingLines.forEach(point => {
            positions.push(point.x, point.y + 1, point.z);
        });
        
        this.fishingLine.geometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(positions, 3)
        );
        this.fishingLine.geometry.attributes.position.needsUpdate = true;
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000  // Increased far plane for massive track
        );
        this.updateCamera();
    }
    
    updateCamera() {
        if (!this.car) return;
        
        // Calculate camera position relative to car
        const carPosition = this.car.position.clone();
        const carRotation = this.car.rotation.y;
        
        // Offset camera behind and above the car
        const offset = this.cameraOffset.clone();
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carRotation);
        
        const cameraPosition = carPosition.clone().add(offset);
        const lookAtPosition = carPosition.clone().add(this.cameraLookOffset);
        
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(lookAtPosition);
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            // Store key status using `event.code` to align with physics checks (e.g. "KeyW", "ArrowUp", "Space")
            this.keys[e.code] = true;
            // Also keep lowercase `e.key` for any existing checks that rely on it
            this.keys[e.key.toLowerCase()] = true;

            // CHEAT CODE: 'i' for infinite coins
            if (e.code === 'KeyI' || e.key.toLowerCase() === 'i') {
                this.playerCoins = 999999;
                this.updateShopDisplay();
                this.playCheatSound();
                console.log('💰 Infinite Coins Cheat Activated! 💰');
            }

            // CHEAT CODE: 'g' for infinite gems
            if (e.code === 'KeyG' || e.key.toLowerCase() === 'g') {
                this.playerGems = 999999;
                this.updateGemShopDisplay();
                this.playCheatSound();
                console.log('💎 Infinite Gems Cheat Activated! 💎');
            }

            // Prevent default space bar behavior (page scrolling)
            if (e.code === 'Space') {
                e.preventDefault();
            }
            
            // 💰 CHEAT CODE: Press "I" for INFINITE COINS! 💰 (duplicate check for safety)
            if (e.code === 'KeyI') {
                this.playerCoins = 999999;
                localStorage.setItem('racingGameCoins', this.playerCoins.toString());
                console.log('🔥 CHEAT ACTIVATED! 💰 Infinite coins: 999,999!');
                
                // Visual feedback
                const cheatMessage = document.createElement('div');
                cheatMessage.textContent = '💰 INFINITE COINS ACTIVATED! 💰';
                cheatMessage.style.position = 'fixed';
                cheatMessage.style.top = '50%';
                cheatMessage.style.left = '50%';
                cheatMessage.style.transform = 'translate(-50%, -50%)';
                cheatMessage.style.backgroundColor = '#FFD700';
                cheatMessage.style.color = '#000000';
                cheatMessage.style.padding = '20px 40px';
                cheatMessage.style.borderRadius = '15px';
                cheatMessage.style.fontSize = '24px';
                cheatMessage.style.fontWeight = 'bold';
                cheatMessage.style.border = '3px solid #FFA500';
                cheatMessage.style.zIndex = '10000';
                cheatMessage.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
                cheatMessage.style.animation = 'pulse 0.5s ease-in-out';
                
                document.body.appendChild(cheatMessage);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    document.body.removeChild(cheatMessage);
                }, 3000);
                
                // Play special cheat sound
                this.playCheatSound();
                
                e.preventDefault();
            }

            // Press 'C' to change circuit (refreshes page for now)
            if (e.code === 'KeyC') {
                console.log('🔄 Changing circuit...');
                location.reload();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            // Clear both representations of the released key
            this.keys[event.code] = false;
            this.keys[event.key.toLowerCase()] = false;
        });
    }
    
    setupUI() {
        const startButton = document.getElementById('startButton');
        startButton.addEventListener('click', () => {
            this.startGame();
        });
        
        // Vehicle selection
        const vehicleOptions = document.querySelectorAll('.vehicle-option');
        vehicleOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove selection from all options
                vehicleOptions.forEach(opt => opt.style.border = '2px solid #666');
                // Highlight selected option
                option.style.border = '3px solid #4CAF50';
                // Set selected vehicle
                this.selectedVehicle = option.getAttribute('data-vehicle');
            });
        });
        
        // Initialize minimap
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Load best time from localStorage
        this.bestTime = localStorage.getItem('carRacingBestTime');
        if (this.bestTime) {
            document.getElementById('bestTimeValue').textContent = this.formatTime(parseFloat(this.bestTime));
        }
        
        // Setup shop system
        this.setupShop();
        
        // Setup gem shop and achievements
        this.setupGemShopButtons();
        this.setupAchievementsButtons();

        // Mobile buttons
        this.setupMobileControls();

        // Shrink vehicle-option visuals for smaller UI on mobile/desktop
        const style = document.createElement('style');
        style.textContent = `.vehicle-option{width:90px;height:90px;font-size:12px;padding:8px}`;
        document.head.appendChild(style);
    }
    
    setupGemShopButtons() {
        // Gem shop evolved vehicle buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('evolved-vehicle-btn')) {
                const vehicle = event.target.getAttribute('data-vehicle');
                const cost = parseInt(event.target.getAttribute('data-cost'));
                this.unlockEvolvedVehicle(vehicle, cost);
            }
        });
        
        // Close gem shop button
        document.getElementById('closeGemShopBtn').addEventListener('click', () => {
            this.closeGemShop();
        });
    }
    
    setupAchievementsButtons() {
        // Close achievements button
        document.getElementById('closeAchievementsBtn').addEventListener('click', () => {
            this.closeAchievements();
        });
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateMinimap() {
        if (!this.minimapCtx || !this.car) return;
        
        const ctx = this.minimapCtx;
        const canvas = this.minimapCanvas;
        const outerRadius = 60;
        const innerRadius = 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw circular loop track
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(75, 75, 50, 0, Math.PI * 2); // Outer edge
        ctx.stroke();
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(75, 75, 35, 0, Math.PI * 2); // Inner edge
        ctx.stroke();
        
        // Fill the track
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(75, 75, 50, 0, Math.PI * 2);
        ctx.arc(75, 75, 35, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Draw car position
        const carPos = this.car.position;
        const distance = Math.sqrt(carPos.x * carPos.x + carPos.z * carPos.z);
        const angle = Math.atan2(carPos.z, carPos.x);
        
        // Map car position to minimap coordinates (scale for massive track)
        const mapRadius = (distance / (this.outerRadius + 20)) * 60; // Scale world coordinates to minimap
        const mapX = 75 + Math.cos(angle) * mapRadius;
        const mapY = 75 + Math.sin(angle) * mapRadius;
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(mapX, mapY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw car direction arrow
        const carAngle = this.car.rotation.y;
        const dirX = mapX + Math.cos(carAngle + angle) * 8;
        const dirY = mapY + Math.sin(carAngle + angle) * 8;
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mapX, mapY);
        ctx.lineTo(dirX, dirY);
        ctx.stroke();
        
        // Draw all AI cars on minimap
        if (this.aiCars.length > 0) {
            const aiColors = ['#0066ff', '#ff6600', '#9900ff', '#00ff99'];
            
            this.aiCars.forEach((aiCar, index) => {
                const aiCarPos = aiCar.position;
                const aiDistance = Math.sqrt(aiCarPos.x * aiCarPos.x + aiCarPos.z * aiCarPos.z);
                const aiAngle = Math.atan2(aiCarPos.z, aiCarPos.x);
                
                // Map AI car position to minimap coordinates (scale for massive track)
                const aiMapRadius = (aiDistance / (this.outerRadius + 20)) * 60;
                const aiMapX = 75 + Math.cos(aiAngle) * aiMapRadius;
                const aiMapY = 75 + Math.sin(aiAngle) * aiMapRadius;
                
                ctx.fillStyle = aiColors[index] || '#ffffff';
                ctx.beginPath();
                ctx.arc(aiMapX, aiMapY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw AI car direction arrow
                const aiCarAngle = aiCar.rotation.y;
                const aiDirX = aiMapX + Math.cos(aiCarAngle + aiAngle) * 6;
                const aiDirY = aiMapY + Math.sin(aiCarAngle + aiAngle) * 6;
                
                ctx.strokeStyle = aiColors[index] || '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(aiMapX, aiMapY);
                ctx.lineTo(aiDirX, aiDirY);
                ctx.stroke();
            });
        }
        
        // Draw checkpoints
        this.checkpoints.forEach((checkpoint, index) => {
            const checkAngle = Math.atan2(checkpoint.position.z, checkpoint.position.x);
            const checkX = 75 + Math.cos(checkAngle) * 42.5; // Middle of track on minimap
            const checkY = 75 + Math.sin(checkAngle) * 42.5;
            
            ctx.fillStyle = checkpoint.passed ? '#00ff00' : (index === 0 ? '#00ff00' : '#ffff00');
            ctx.beginPath();
            ctx.arc(checkX, checkY, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createEngineSound();
            this.audioInitialized = true;
        } catch (error) {
            console.log('Audio not supported or blocked');
        }
    }
    
    createEngineSound() {
        if (!this.audioContext) return;
        
        // Create engine sound using oscillators
        this.engineOscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        this.engineOscillator.type = 'sawtooth';
        this.engineOscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        this.engineOscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.engineOscillator.start();
        this.engineGainNode = gainNode;
    }
    
    updateEngineSound() {
        if (!this.audioInitialized || !this.engineOscillator) return;
        
        const speedFactor = Math.abs(this.carSpeed) / this.maxSpeed;
        const frequency = 100 + (speedFactor * 300); // 100Hz to 400Hz
        const volume = 0.05 + (speedFactor * 0.15); // 0.05 to 0.2
        
        this.engineOscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        this.engineGainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
    
    playCheckpointSound() {
        if (!this.audioInitialized) return;
        
        // Create a brief beep sound for checkpoints
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    startGame() {
        this.gameStarted = true;
        this.raceStartTime = Date.now();
        document.getElementById('startScreen').style.display = 'none';
        
        // Create player vehicle based on selection
        this.recreatePlayerVehicle();
        
        // Initialize audio on first user interaction
        if (!this.audioInitialized) {
            this.initAudio();
        }
        
        // Reset game state
        this.currentLap = 1;
        this.lastCheckpoint = 0;
        this.checkpoints.forEach(checkpoint => checkpoint.passed = false);
        this.coinsCollectedThisRace = 0; // Reset race coin counter
        
        // Reset all AI cars state
        this.aiCarsData.forEach(aiData => {
            aiData.currentLap = 1;
            aiData.lastCheckpoint = 0;
            aiData.speed = 0.4 + Math.random() * 0.1; // Much faster AI reset speed
        });
        
        this.updateUI();
        this.setupMobileControls();   // create buttons once game view is active
    }
    
    updateUI() {
        document.getElementById('currentLap').textContent = this.currentLap;
        document.getElementById('speed').textContent = Math.round(this.carSpeed * 200);
        
        // Calculate player position among all racers
        const playerProgress = (this.checkpoints.length > 0) ? this.currentLap + (this.lastCheckpoint / this.checkpoints.length) : 0;
        let position = 1;
        
        if (this.aiCarsData.length > 0) {
            // Show AI lap info (just the leading AI)
            const leadingAI = this.aiCarsData.reduce((leader, ai) => {
                const aiProgress = (this.checkpoints.length > 0) ? ai.currentLap + (ai.lastCheckpoint / this.checkpoints.length) : 0;
                const leaderProgress = (this.checkpoints.length > 0) ? leader.currentLap + (leader.lastCheckpoint / this.checkpoints.length) : 0;
                return aiProgress > leaderProgress ? ai : leader;
            });
            
            document.getElementById('aiCurrentLap').textContent = leadingAI.currentLap;
            
            // Calculate position
            this.aiCarsData.forEach(aiData => {
                const aiProgress = (this.checkpoints.length > 0) ? aiData.currentLap + (aiData.lastCheckpoint / this.checkpoints.length) : 0;
                if (aiProgress > playerProgress) position++;
            });
        }
        
        const positionText = ['1st 🥇', '2nd 🥈', '3rd 🥉', '4th', '5th'][position - 1] || '5th';
        const positionColors = ['#ffcc00', '#cccccc', '#cd7f32', '#white', '#white'];
        
        document.getElementById('positionValue').textContent = positionText;
        document.getElementById('positionValue').style.color = positionColors[position - 1];
        
        if (this.gameStarted) {
            const elapsed = (Date.now() - this.raceStartTime) / 1000;
            const minutes = Math.floor(elapsed / 60);
            const seconds = Math.floor(elapsed % 60);
            document.getElementById('raceTime').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update boost meter
        this.updateBoostMeter();
        
        // Update vehicle info (once at start)
        if (!this.vehicleInfoUpdated) {
            this.updateVehicleInfo();
            this.vehicleInfoUpdated = true;
        }
        
        // Update coin display
        document.getElementById('coinCount').textContent = this.playerCoins;
        document.getElementById('raceCoins').textContent = this.coinsCollectedThisRace;
        
        // Update gem display
        document.getElementById('gemCount').textContent = this.playerGems;
    }
    
    updateBoostMeter() {
        const boostCooldownTime = Math.max(1000, 3000 - (this.boostUpgrades * 500));
        const cooldownRemaining = Math.max(0, boostCooldownTime - (Date.now() - this.lastBoostTime));
        const boostFill = document.getElementById('boostFill');
        const boostCooldown = document.getElementById('boostCooldown');
        
        if (this.boostPower > 0) {
            // Currently boosting
            boostFill.style.width = '100%';
            boostFill.style.background = 'linear-gradient(90deg, #00ff00, #ffff00)';
            boostCooldown.textContent = 'BOOSTING!';
        } else if (cooldownRemaining > 0) {
            // On cooldown
            const percentage = ((boostCooldownTime - cooldownRemaining) / boostCooldownTime) * 100;
            boostFill.style.width = percentage + '%';
            boostFill.style.background = 'linear-gradient(90deg, #666666, #999999)';
            boostCooldown.textContent = Math.ceil(cooldownRemaining / 1000) + 's';
        } else {
            // Ready to boost
            boostFill.style.width = '100%';
            boostFill.style.background = this.boostUpgrades > 0 ? 
                'linear-gradient(90deg, #00ff00, #ffff00)' : 
                'linear-gradient(90deg, #ffff00, #ff6600)';
            boostCooldown.textContent = this.boostUpgrades > 0 ? 'UPGRADED!' : 'READY!';
        }
    }
    
    updateVehicleInfo() {
        const vehicleNames = {
            car: 'Racing Car 🚗',
            aeroplane: 'Aeroplane ✈️',
            ufo: 'UFO 🛸',
            toilet: 'Toilet 🚽',
            tposing: 'T-Posing Man 🧍',
            hyperchair: 'Hyperspace Chair 🚀',
            electriccar: 'Electric Car ⚡',
            shoppingcart: 'TURBO Cart 🛒',
            duckhorse: 'Duck-Horse Hybrid 🦆',
            rocket: 'ROCKET 🚀',
            shopvehicle: 'Mobile Shop 🏪'
        };
        
        const vehicleMultipliers = this.getVehicleMultipliers();
        const name = vehicleNames[this.selectedVehicle] || 'Racing Car 🚗';
        
        // Convert multipliers to star ratings
        const getStars = (value) => {
            const stars = Math.round(value * 3);
            return '★'.repeat(Math.max(1, Math.min(5, stars))) + '☆'.repeat(Math.max(0, 5 - stars));
        };
        
        const maxSpeedStars = getStars(vehicleMultipliers.maxSpeed);
        const accelStars = getStars(vehicleMultipliers.acceleration);
        const turnStars = getStars(vehicleMultipliers.turning);
        
        // Check for upgrades
        const upgrades = this.vehicleUpgrades[this.selectedVehicle] || {};
        const hasUpgrades = Object.keys(upgrades).length > 0;
        
        document.getElementById('vehicleName').textContent = name + (hasUpgrades ? ' ⬆️' : '');
        document.getElementById('vehicleStats').textContent = 
            `Max Speed: ${maxSpeedStars} | Acceleration: ${accelStars} | Turning: ${turnStars}`;
    }
    
    updateCarPhysics() {
        if (!this.gameStarted) return;
        
        let accelerating = false;
        let turning = 0;
        
        // Vehicle-specific physics
        const vehicleMultipliers = this.getVehicleMultipliers();
        
        // Handle input
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            const accel = this.acceleration * vehicleMultipliers.acceleration;
            this.carSpeed = Math.min(this.carSpeed + accel, this.maxSpeed * vehicleMultipliers.maxSpeed);
            accelerating = true;
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            const brake = this.acceleration * vehicleMultipliers.acceleration;
            this.carSpeed = Math.max(this.carSpeed - brake, -this.maxSpeed * vehicleMultipliers.maxSpeed * 0.5);
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            turning = 1;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            turning = -1;
        }
        
        // MEGA BOOST system (SPACE key) - with upgrades
        const boostCooldown = Math.max(500, 2500 - (this.boostUpgrades * 400)); // Faster cooldown
        if (this.keys['Space'] && Date.now() - this.lastBoostTime > boostCooldown) {
            this.boostPower = 45; // Longer boost duration
            this.lastBoostTime = Date.now();
            this.updateRaceStats('boostsUsed');
            this.playBoostSound();
        }
        
        // Apply MEGA boost (capped)
        if (this.boostPower > 0) {
            const boostTopSpeed = this.maxSpeed * vehicleMultipliers.maxSpeed * 1.3; // 1.3× normal top speed cap
            // Smooth acceleration towards boostTopSpeed without runaway multiplication
            this.carSpeed += (boostTopSpeed - this.carSpeed) * 0.15; // ease toward cap
            this.boostPower--;
            this.createBoostParticles();
        }
        
        // Apply friction
        if (!accelerating) {
            this.carSpeed *= this.friction;
        }
        
        // Turn the car (improved turning mechanics)
        if (turning !== 0) {
            // Allow turning even when stationary, but scale with speed
            const speedMultiplier = Math.max(0.3, Math.abs(this.carSpeed) / this.maxSpeed);
            this.car.rotation.y += turning * this.turnSpeed * speedMultiplier;
        }
        
        // Move the car
        const direction = new THREE.Vector3(0, 0, -this.carSpeed);
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.car.rotation.y);
        this.car.position.add(direction);
        
        // Check track boundaries and collisions
        this.checkBoundaries();
        // Checkpoints disabled
        this.checkCarCollision();
        
        // Check for jump pad interaction
        this.checkJumpPads();
    }
    
    checkBoundaries() {
        if (!this.car) return;

        const dist = Math.sqrt(this.car.position.x * this.car.position.x + this.car.position.z * this.car.position.z);

        // Outer barrier – keep car inside rail (tube radius ≈1) so subtract 0.5 buffer
        if (dist > this.outerRadius - 0.5) {
            const angle = Math.atan2(this.car.position.z, this.car.position.x);
            // reposition car just inside barrier
            this.car.position.x = Math.cos(angle) * (this.outerRadius - 1.2);
            this.car.position.z = Math.sin(angle) * (this.outerRadius - 1.2);
            // bounce effect
            this.carSpeed *= -0.4;
        }

        // Inner boundary – prevent cutting through inner rail
        if (dist < this.innerRadius + 0.5) {
            const angle = Math.atan2(this.car.position.z, this.car.position.x);
            this.car.position.x = Math.cos(angle) * (this.innerRadius + 1.2);
            this.car.position.z = Math.sin(angle) * (this.innerRadius + 1.2);
            this.carSpeed *= -0.3; // small bounce
        }
    }
    
    checkCarCollision() {
        if (!this.car || this.aiCars.length === 0) return;
        
        // Check collision with all AI cars
        this.aiCars.forEach((aiCar, index) => {
            const distance = this.car.position.distanceTo(aiCar.position);
            
            if (distance < 8) { // Collision detected (larger radius for massive scale)
                // Slow down both vehicles
                this.carSpeed *= 0.85;
                this.aiCarsData[index].speed *= 0.85;
                
                // Push cars apart slightly
                const pushDirection = new THREE.Vector3()
                    .subVectors(this.car.position, aiCar.position)
                    .normalize()
                    .multiplyScalar(1); // Larger push for massive scale
                
                this.car.position.add(pushDirection);
                aiCar.position.sub(pushDirection);
                
                // Play collision sound
                this.playCollisionSound();
            }
        });
        
        // Check AI vs AI collisions
        for (let i = 0; i < this.aiCars.length; i++) {
            for (let j = i + 1; j < this.aiCars.length; j++) {
                const distance = this.aiCars[i].position.distanceTo(this.aiCars[j].position);
                
                if (distance < 7) {
                    // Slow down both AI cars
                    this.aiCarsData[i].speed *= 0.9;
                    this.aiCarsData[j].speed *= 0.9;
                    
                    // Push AI cars apart
                    const pushDirection = new THREE.Vector3()
                        .subVectors(this.aiCars[i].position, this.aiCars[j].position)
                        .normalize()
                        .multiplyScalar(0.8);
                    
                    this.aiCars[i].position.add(pushDirection);
                    this.aiCars[j].position.sub(pushDirection);
                }
            }
        }

        // Collision with moving obstacle arms
        // this.movingObstacles.forEach(o => {
        //     // Arm world position (approx end point)
        //     const armEnd = new THREE.Vector3(armLength=0,0,0);
        // });
    }
    
    playCollisionSound() {
        if (!this.audioInitialized) return;
        
        // Create a crash sound for collisions
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    updateAllAICarsPhysics() {
        if (!this.gameStarted || this.aiCars.length === 0) return;
        
        this.aiCars.forEach((aiCar, index) => {
            const aiData = this.aiCarsData[index];
            
            // Better AI speed scaling based on track radius
            const speedMultiplier = aiData.trackRadius / this.trackRadius; // Normalize to selected track size
            const adjustedSpeed = aiData.speed / speedMultiplier;
            
            // Update AI car angle to drive in circle (more consistent)
            aiData.angle += adjustedSpeed / aiData.trackRadius;
            
            // Keep angle in valid range
            if (aiData.angle > Math.PI * 2) {
                aiData.angle -= Math.PI * 2;
            }
            
            // Calculate AI car position on circular track
            const x = Math.cos(aiData.angle) * aiData.trackRadius;
            const z = Math.sin(aiData.angle) * aiData.trackRadius;
            
            // Smooth position updates to prevent AI cars from jumping
            const targetPos = new THREE.Vector3(x, aiCar.position.y, z);
            aiCar.position.lerp(targetPos, 0.1); // Smooth interpolation
            
            // Different height for different vehicle types with smoother motion
            const time = Date.now() * 0.001; // Slower time multiplier
            if (aiData.vehicleType === 'aeroplane') {
                aiCar.position.y = 8 + Math.sin(time * 2 + index) * 1.5;
            } else if (aiData.vehicleType === 'ufo') {
                aiCar.position.y = 6 + Math.sin(time * 1.5 + index) * 2;
            } else if (aiData.vehicleType === 'hyperchair') {
                aiCar.position.y = 4 + Math.sin(time * 1.8 + index) * 0.8;
            } else {
                aiCar.position.y = 2;
            }
            
            // Point AI car in direction of movement (more accurate)
            const targetRotation = aiData.angle + Math.PI / 2;
            
            // Smooth rotation updates
            let rotationDiff = targetRotation - aiCar.rotation.y;
            if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
            if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
            
            aiCar.rotation.y += rotationDiff * 0.1; // Smooth rotation
            
            // Smaller variation for more stable driving
            const variation = Math.sin(time * 0.8 + index) * 0.01;
            aiCar.rotation.y += variation;
            
            // Check AI checkpoints (disabled)
        });
    }
    
    createPlayerVehicle() {
        // Create initial player vehicle (will be recreated on start)
        this.car = this.createVehicle('car', 0xff0000);
        this.car.position.set(this.trackRadius, 2, 0); // Start position based on selected circuit
        this.scene.add(this.car);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.frameCount++;
        const now = performance.now();
        
        // Track distance traveled for achievements
        if (this.gameStarted && this.car && this.lastCarPosition) {
            const distance = this.car.position.distanceTo(this.lastCarPosition);
            this.updateRaceStats('distanceTraveled', distance);
        }
        if (this.car) {
            this.lastCarPosition = this.car.position.clone();
        }
        
        // PERFORMANCE OPTIMIZATION: Reduce update frequency for non-critical elements
        this.updateCarPhysics();
        this.updateAllAICarsPhysics();
        this.updateMovingObstacles();
        this.updateCamera();
        
        // Update UI every 3 frames for better performance
        if (this.frameCount % 3 === 0) {
            this.updateUI();
            this.updateEngineSound();
        }
        
        // Update minimap every 5 frames for better performance
        if (this.frameCount % 5 === 0) {
            this.updateMinimap();
        }
        
        // Fishing line trail DISABLED for performance
        // if (this.frameCount % 2 === 0) {
        //     this.updateFishingLineTrail();
        // }
        
        // Update coins every frame (important for collection)
        this.updateCoins();
        
        // Performance monitoring every 120 frames (2 seconds at 60fps)
        if (this.frameCount % 120 === 0 && now - this.lastPerformanceCheck > 2000) {
            const fps = 1000 / (now - this.lastPerformanceCheck) * 120;
            if (fps < 30 && !this.lowPerformanceMode) {
                console.warn('⚠️ Low FPS detected:', Math.round(fps), 'fps - Enabling performance mode');
                this.lowPerformanceMode = true;
            }
            this.lastPerformanceCheck = now;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Create vertical cylinder barriers around the outer edge of the track
    createBarriers(outerRadius) {
        const barrierCount = 64; // number of barrier posts
        const barrierHeight = 6;
        const radius = outerRadius + 1; // just outside track
        const geometry = new THREE.CylinderGeometry(1, 1, barrierHeight, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // dark red

        for (let i = 0; i < barrierCount; i++) {
            const angle = (i / barrierCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const post = new THREE.Mesh(geometry, material);
            post.position.set(x, barrierHeight / 2, z);
            post.castShadow = false;
            this.scene.add(post);
        }
    }

    buildGemShopUI() {
        const gemShopScreen = document.getElementById('gemShopScreen');
        if (!gemShopScreen) return;

        // ensure a grid container exists
        let grid = document.getElementById('evolvedGrid');
        if (!grid) {
            grid = document.createElement('div');
            grid.id = 'evolvedGrid';
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;width:100%;max-width:1400px;';
            gemShopScreen.insertBefore(grid, document.getElementById('closeGemShopBtn'));
        }

        // Populate entries
        Object.entries(this.evolvedVehicleCatalog).forEach(([key,data]) => {
            if (grid.querySelector(`[data-vehicle="${key}"]`)) return; // already added

            const card = document.createElement('div');
            card.className = 'evolved-vehicle-item';
            card.style.cssText = 'background:rgba(255,255,255,0.1);padding:20px;border-radius:15px;border:2px solid #9900ff;text-align:center;';

            card.innerHTML = `
                <div style="font-size:60px;">${data.emoji}</div>
                <h3 style="color:#9900ff;margin:10px 0;">${data.name}</h3>
                <p style="font-size:14px;margin:10px 0;">Evolved performance vehicle.</p>
                <button class="evolved-vehicle-btn" data-vehicle="${key}" data-cost="${data.cost}" style="padding:12px 25px;background:#9900ff;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:16px;">Unlock for ${data.cost} 💎</button>`;

            grid.appendChild(card);
        });

        // refresh display state for new buttons
        this.updateGemShopDisplay();
    }

    // 🚀 MOBILE CONTROLS
    setupMobileControls() {
        if (!('ontouchstart' in window)) return; // non-touch devices skip

        const btnStyle = 'position:fixed;background:rgba(255,255,255,0.4);border:2px solid #666;border-radius:10px;width:60px;height:60px;z-index:300;display:flex;justify-content:center;align-items:center;font-size:24px;font-weight:bold;color:#000;';
        const makeBtn = (txt,x,y)=>{const b=document.createElement('div');b.textContent=txt;b.style.cssText=btnStyle+`left:${x}px;bottom:${y}px;`;document.body.appendChild(b);return b};

        const left = makeBtn('◀',20,100);
        const right = makeBtn('▶',140,100);
        const up = makeBtn('▲',80,170);
        const down = makeBtn('▼',80,30);
        const boost = makeBtn('⚡',window.innerWidth-80,100);

        const map = new Map([[left,'KeyA'],[right,'KeyD'],[up,'KeyW'],[down,'KeyS'],[boost,'Space']]);
        map.forEach((code,btn)=>{
            btn.addEventListener('touchstart', e=>{
                e.preventDefault();
                this.keys[code]=true;
            },{passive:false});
            btn.addEventListener('touchend',e=>{e.preventDefault();this.keys[code]=false;});
        });
        console.log('✅ Mobile touch controls enabled');
    }

    // Continuous border rails at both inner and outer edge of the circuit
    createTrackBorders(outerRadius, innerRadius) {
        if (this.trackBordersGroup) {
            // Remove previous borders if recreating track
            this.scene.remove(this.trackBordersGroup);
        }

        this.trackBordersGroup = new THREE.Group();

        const tubeRadius = 1; // thickness of the rail
        const segments = 256;
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

        // Helper to make a torus ring lying flat on ground
        const makeRail = (radius) => {
            const geom = new THREE.TorusGeometry(radius, tubeRadius, 8, segments);
            const mesh = new THREE.Mesh(geom, railMaterial);
            mesh.rotation.x = Math.PI / 2; // lay flat
            mesh.position.y = tubeRadius; // slightly above ground
            mesh.receiveShadow = false;
            mesh.castShadow = false;
            return mesh;
        };

        this.trackBordersGroup.add(makeRail(outerRadius + 0.5));
        this.trackBordersGroup.add(makeRail(innerRadius - 0.5));

        this.scene.add(this.trackBordersGroup);
    }

    // === OBSTACLES & JUMP PADS ===
    createMovingObstacles(outerRadius, innerRadius) {
        this.movingObstacles = [];

        const armLength = (outerRadius - innerRadius) + 4; // extend a bit past track width
        const armGeom = new THREE.BoxGeometry(armLength, 1, 1);
        const armMat  = new THREE.MeshLambertMaterial({ color: 0xffaa00 });

        const armCount = 3;
        for (let i = 0; i < armCount; i++) {
            const pivot = new THREE.Object3D();
            const arm = new THREE.Mesh(armGeom, armMat);
            arm.position.x = (innerRadius + outerRadius) / 2;
            arm.position.y = 2;
            pivot.add(arm);
            this.scene.add(pivot);

            this.movingObstacles.push({ pivot, speed: 0.005 + 0.002 * i });
        }
    }

    createJumpPads(outerRadius, innerRadius) {
        this.jumpPads = [];
        const padGeom = new THREE.CylinderGeometry(8, 8, 0.8, 32);
        const padMat  = new THREE.MeshLambertMaterial({ color: 0x00ff7f, emissive: 0x004400 });

        const padAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4];
        const radius = (outerRadius + innerRadius) / 2;

        padAngles.forEach(angle => {
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const mesh = new THREE.Mesh(padGeom, padMat);
            mesh.rotation.x = Math.PI / 2;
            mesh.position.set(x, 0.3, z);
            this.scene.add(mesh);
            this.jumpPads.push({ position: new THREE.Vector3(x, 0, z), radius: 10 });
        });
    }

    updateMovingObstacles() {
        this.movingObstacles.forEach(o => {
            o.pivot.rotation.y += o.speed;
        });
    }

    checkJumpPads() {
        if (!this.car) return;
        const now = performance.now();
        if (!this._lastPadTime) this._lastPadTime = 0;

        this.jumpPads.forEach(pad => {
            const dist = this.car.position.distanceTo(pad.position);
            if (dist < pad.radius && now - this._lastPadTime > 1000) {
                // small speed & Y boost
                this.carSpeed = Math.max(this.carSpeed, 1) + 0.5;
                this.car.position.y += 6;
                this._lastPadTime = now;
                this.playBoostSound();
            }
        });
    }

    // Generate three arc pieces to form track with gaps
    createRingSegments(outerRadius, innerRadius) {
        // Remove old track if exists
        if (this.trackGroup) {
            this.scene.remove(this.trackGroup);
        }

        this.trackGroup = new THREE.Group();
        const arcCount = 3;
        const gapSize = Math.PI / 6; // 30° gaps
        const segmentLength = (Math.PI * 2 - arcCount * gapSize) / arcCount;

        const segMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

        for (let i = 0; i < arcCount; i++) {
            const thetaStart = i * (segmentLength + gapSize);
            const segmentGeom = new THREE.RingGeometry(innerRadius, outerRadius, 64, 1, thetaStart, segmentLength);
            const mesh = new THREE.Mesh(segmentGeom, segMaterial);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.y = 0.01;
            this.trackGroup.add(mesh);
        }

        this.scene.add(this.trackGroup);
    }
}

// Global game instance for shop access
let game = null;

function initGame() {
    try {
        console.log('🎮 Initializing game...');
        if (typeof THREE === 'undefined') {
            console.error('❌ THREE.js not loaded yet, retrying...');
            setTimeout(initGame, 100);
            return;
        }
        
        console.log('✅ THREE.js loaded, starting game!');
        game = new CarRacingGame();
        window.game = game; // Make globally accessible for HTML buttons
        game.init();
        console.log('🛒 Shop functions now available globally!');
        console.log('🔧 Available shop methods:', {
            openShop: typeof game.openShop,
            openGemShop: typeof game.openGemShop,
            showAchievements: typeof game.showAchievements
        });
        
        // Check achievements on startup
        setTimeout(() => {
            game.checkAchievements();
        }, 1000);
    } catch (error) {
        console.error('❌ Game initialization failed:', error);
        setTimeout(() => {
            alert('🚨 GAME STARTUP FAILED!\n\nError: ' + error.message + '\n\nTrying again...\nMake sure you have a stable internet connection.');
            initGame(); // Retry
        }, 1000);
    }
}

// Initialize game when page loads AND Three.js is ready
window.addEventListener('load', () => {
    console.log('📄 Page loaded, checking for THREE.js...');
    setTimeout(initGame, 200); // Give Three.js time to load
}); 