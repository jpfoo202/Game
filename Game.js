class Example extends Phaser.Scene {
    constructor() {
        super();
        this.cocktails = [
            'Mojito', 'Margarita', 'Martini', 'Daiquiri', 'Old Fashioned',
            'Negroni', 'Moscow Mule', 'Whiskey Sour', 'Gin and Tonic', 'Cosmopolitan',
            'Piña Colada', 'Aperol Spritz', 'Bloody Mary', 'Mai Tai',
            'Caipirinha', 'Paloma', 'Espresso Martini', 'Passion Fruit Martini', 'Gin Bramble',
            'Gin Fizz', 'Campari Spritz', 'Americano', 'Manhattan', 'Baby Guinness'
        ];
        this.glasses = [
            'Highball', 'Martini', 'Lowball', 'Margarita Glass', 'Coupe',
            'Hurricane', 'Champagne Flute', 'Wine Glass', 'Shot',
            'Copper Mug', 'Pint'
        ];
        this.selectedCocktails = {};
        this.selectedGlass = null;
        this.totalPrice = 0;
        this.selectedIngredients = new Set(); // New property to track selected ingredients
        this.colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        this.currentOrderGlass = null;
        this.glassButtons = {};
        this.ingredients = [
            'Vodka', 'Gin', 'Rum', 'Tequila', 'Whiskey',
            'Brandy', 'Lemon', 'Lime', 'Simple Syrup',
            'Ginger beer', 'Prosecco', 'Soda',
            'Baileys', 'Bitters', 'Vermouth', 'Campari', 'Aperol',
            'Kahlua', 'Espresso', 'Cachaça', 'Egg White',
            'Passoa', 'Passion fruit-j', 'Mint', 'Blackberry Liqueur',
            'Pineapple Juice', 'Cola', 'Coconut Cream', 'Cointreau',
            'Orgeat', 'Cranberry Juice', 'Orange Juice',
            'Orange slice', 'Lime slice', 'Passion fruit',
            'Grapefruit Soda', 'Tomato juice', 'Tabasco',
            'Worcestershire sauce', 'Salt', 'Pepper', 'Cherry'
        ];
        this.ingredientButtons = {};
    }

    lastCocktail = null;

    preload() {
        this.load.image('barBackground', 'https://play.rosebud.ai/assets/bar room from behind the bar.png?uUa7');
        this.load.audio('buttonClick', 'https://play.rosebud.ai/assets/click-buttons-ui-menu-sounds-effects-button-8-205394.mp3?A8jX');
    }
    create() {
        // Add the background image
        const background = this.add.image(400, 300, 'barBackground');
        background.setDisplaySize(800, 600);
        // Add black background for "Current Orders" title and order display
        const bgWidth = 400;
        const bgHeight = 80;
        const bgX = this.cameras.main.width / 2 - bgWidth / 2;
        const bgY = 10;
        const textBackground = this.add.rectangle(bgX, bgY, bgWidth, bgHeight, 0x000000);
        textBackground.setOrigin(0, 0);
        textBackground.setAlpha(0.7); // Set transparency to 70%
        // Add "Current Orders" title
        this.add.text(this.cameras.main.width / 2, 20, 'Current Orders', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        // Generate and display first order
        this.currentOrder = this.generateRandomOrder();
        const orderText = `Current Order: ${this.currentOrder}`;
        this.orderDisplay = this.add.text(this.cameras.main.width / 2, 50, orderText, {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.createGlassList();
        this.createIngredientList();
    }
    createGlassList() {
        const columns = 6;
        const maxWidth = this.cameras.main.width * 0.98; // 98% of screen width, matching ingredient buttons
        const buttonWidth = Math.min(95, maxWidth / columns); // Slightly reduced button width
        const buttonHeight = buttonWidth * 0.5; // Match ingredient button height ratio
        const spacingX = buttonWidth * 1.05; // Match ingredient button spacing
        const spacingY = buttonHeight * 1.3; // Slightly increased vertical spacing
        const rows = Math.ceil(this.glasses.length / columns);
        const totalHeight = rows * spacingY;
        const totalWidth = columns * spacingX;
        const startY = this.cameras.main.height - totalHeight - 330;
        const startX = (this.cameras.main.width - totalWidth) / 2 + buttonWidth / 2;
        // Add black background for title
        const glassTitleBg = this.add.rectangle(this.cameras.main.width / 2, startY - 40, 200, 40, 0x000000);
        glassTitleBg.setAlpha(0.7);
        // Add title
        this.glassTitle = this.add.text(this.cameras.main.width / 2, startY - 40, 'Select a Glass', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.glasses.forEach((glass, index) => {
            const x = startX + (index % columns) * spacingX;
            const y = startY + Math.floor(index / columns) * spacingY;
            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x87CEEB); // Light blue color
            button.setInteractive();
            this.glassButtons[glass] = button;
            const words = glass.split(' ');
            const text = this.add.text(x, y, words.join('\n'), {
                fontSize: '12px', // Match ingredient button font size
                fill: '#000',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: {
                    width: buttonWidth - 6
                }
            }).setOrigin(0.5);
            button.on('pointerdown', () => this.selectGlass(glass));
        });
    }
    selectGlass(glass) {
        this.sound.play('buttonClick');
        if (glass === this.currentOrderGlass) {
            this.selectedGlass = glass;
            this.glassButtons[glass].setFillStyle(0x00ff00); // Green for correct
            console.log(`Correct! Selected glass: ${glass}`);
            this.createFlashEffect(this.glassButtons[glass]);
            this.createLaserFlashEffectForButton(this.glassButtons[glass]);
            // Check if all ingredients have been selected
            if (this.currentOrderIngredients.length === 0) {
                console.log('Order completed correctly!');
                this.createCelebrationEffect();
                this.time.delayedCall(2000, () => {
                    this.generateNewOrder();
                });
            }
        } else {
            this.glassButtons[glass].setFillStyle(0xff0000); // Red for incorrect
            this.cameras.main.shake(250, 0.01); // Slight shake for 250ms
            console.log(`Incorrect! Selected glass: ${glass}, Required: ${this.currentOrderGlass}`);
        }
    }
    createFlashEffect(button) {
        const flash = this.add.rectangle(button.x, button.y, button.width, button.height, 0xffffff);
        flash.setAlpha(0);
        this.tweens.add({
            targets: flash,
            alpha: {
                start: 0.8,
                to: 0
            },
            ease: 'Linear',
            duration: 200,
            repeat: 0,
            yoyo: false,
            onComplete: () => {
                flash.destroy();
            }
        });
        this.createLaserFlashEffectForButton(button);
    }
    createLaserFlashEffectForButton(button) {
        const thickness = 2;
        const color = 0x00ff00; // Bright green color for the laser
        const padding = 2; // Space between button and laser
        // Create four rectangles for each side of the button
        const top = this.add.rectangle(button.x, button.y - button.height / 2 - padding, button.width + padding * 2, thickness, color);
        const right = this.add.rectangle(button.x + button.width / 2 + padding, button.y, thickness, button.height + padding * 2, color);
        const bottom = this.add.rectangle(button.x, button.y + button.height / 2 + padding, button.width + padding * 2, thickness, color);
        const left = this.add.rectangle(button.x - button.width / 2 - padding, button.y, thickness, button.height + padding * 2, color);
        const borders = [top, right, bottom, left];
        borders.forEach(border => border.setAlpha(0));
        // Animate the laser flash
        this.tweens.add({
            targets: borders,
            alpha: 1,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                borders.forEach(border => border.destroy());
            }
        });
    }
    createIngredientList() {
        const columns = 7;
        const maxWidth = this.cameras.main.width * 0.98;
        const buttonWidth = Math.min(90, maxWidth / columns);
        const buttonHeight = buttonWidth * 0.5;
        const spacingX = buttonWidth * 1.05; // Reduced horizontal spacing
        const spacingY = buttonHeight * 1.2; // Reduced vertical spacing
        const rows = Math.ceil(this.ingredients.length / columns);
        const totalHeight = rows * spacingY;
        const totalWidth = columns * spacingX;
        // Calculate the available space
        const topMargin = 100; // Space for the top order display
        const bottomMargin = 20; // Space at the bottom of the screen
        const availableHeight = this.cameras.main.height - topMargin - bottomMargin;
        // Calculate the bottom of the glass buttons
        const glassRows = Math.ceil(this.glasses.length / columns);
        const glassButtonsHeight = glassRows * spacingY;
        // Calculate the start Y position for ingredients
        const startY = topMargin + (availableHeight - totalHeight - glassButtonsHeight) / 2 + glassButtonsHeight + spacingY;
        const startX = (this.cameras.main.width - totalWidth) / 2 + spacingX / 2;
        // Calculate the position for the title
        const titleX = this.cameras.main.width / 2;
        const titleY = startY - 35;
        // Add black background for title
        const ingredientsTitleBg = this.add.rectangle(titleX, titleY, 250, 40, 0x000000);
        ingredientsTitleBg.setAlpha(0.7);
        // Add title
        this.ingredientsTitle = this.add.text(titleX, titleY, 'Select Ingredients', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.ingredients.forEach((ingredient, index) => {
            const x = startX + (index % columns) * spacingX;
            const y = startY + Math.floor(index / columns) * spacingY;
            const button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x90EE90); // Light green color
            button.setInteractive();
            this.ingredientButtons[ingredient] = button;
            const words = ingredient.split(' ');
            const text = this.add.text(x, y, words.join('\n'), {
                fontSize: '12px', // Increased font size
                fill: '#000',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: {
                    width: buttonWidth - 6
                }
            }).setOrigin(0.5);
            button.on('pointerdown', () => this.selectIngredient(ingredient));
        });
    }
    selectIngredient(ingredient) {
        this.sound.play('buttonClick');
        if (this.currentOrderIngredients.includes(ingredient)) {
            // If the ingredient is correct, always allow selection
            this.ingredientButtons[ingredient].setFillStyle(0x00ff00); // Green for correct
            console.log(`Correct! Selected ingredient: ${ingredient}`);
            this.createFlashEffect(this.ingredientButtons[ingredient]);
            this.createLaserFlashEffectForButton(this.ingredientButtons[ingredient]);
            // Remove the ingredient if it's correct, regardless of previous selections
            if (!this.selectedIngredients.has(ingredient)) {
                this.selectedIngredients.add(ingredient);
                this.currentOrderIngredients = this.currentOrderIngredients.filter(i => i !== ingredient);
            }
            // Check if all ingredients have been selected and the correct glass is chosen
            if (this.currentOrderIngredients.length === 0 && this.selectedGlass === this.currentOrderGlass) {
                console.log('Order completed correctly!');
                this.createCelebrationEffect();
                this.time.delayedCall(2000, () => {
                    this.generateNewOrder();
                });
            }
        } else {
            // Show incorrect feedback but don't prevent future correct selections
            this.ingredientButtons[ingredient].setFillStyle(0xff0000); // Red for incorrect
            this.cameras.main.shake(250, 0.01); // Slight shake for 250ms
            console.log(`Incorrect! Selected ingredient: ${ingredient}`);
        }
    }
    generateRandomOrder() {
        let randomCocktail;
        do {
            randomCocktail = this.cocktails[Math.floor(Math.random() * this.cocktails.length)];
        } while (randomCocktail === this.lastCocktail);
        this.lastCocktail = randomCocktail;
        if (randomCocktail === 'Whiskey Sour') {
            this.currentOrderGlass = 'Coupe';
        } else if (randomCocktail === 'Espresso Martini') {
            this.currentOrderGlass = 'Coupe';
        } else if (randomCocktail === 'Martini' || randomCocktail === 'Manhattan') {
            this.currentOrderGlass = 'Martini';
        } else if (randomCocktail === 'Passion Fruit Martini') {
            this.currentOrderGlass = 'Coupe';
        } else if (randomCocktail === 'Daiquiri') {
            this.currentOrderGlass = 'Coupe';
        } else if (randomCocktail === 'Moscow Mule') {
            this.currentOrderGlass = 'Copper Mug';
        } else if (randomCocktail === 'Caipirinha') {
            this.currentOrderGlass = 'Lowball';
        } else if (randomCocktail === 'Aperol Spritz' || randomCocktail === 'Campari Spritz') {
            this.currentOrderGlass = 'Wine Glass';
        } else if (randomCocktail === 'Margarita') {
            this.currentOrderGlass = 'Margarita Glass';
        } else if (randomCocktail === 'Old Fashioned') {
            this.currentOrderGlass = 'Lowball';
        } else if (randomCocktail === 'Gin Bramble') {
            this.currentOrderGlass = 'Lowball';
        } else if (randomCocktail === 'Cosmopolitan') {
            this.currentOrderGlass = 'Martini';
        } else if (randomCocktail === 'Negroni') {
            this.currentOrderGlass = 'Lowball';
        } else if (randomCocktail === 'Paloma') {
            this.currentOrderGlass = 'Highball';
        } else if (randomCocktail === 'Piña Colada') {
            this.currentOrderGlass = 'Hurricane';
        } else if (randomCocktail === 'Gin and Tonic') {
            this.currentOrderGlass = 'Highball';
        } else if (randomCocktail === 'Bloody Mary') {
            this.currentOrderGlass = 'Highball';
        } else if (randomCocktail === 'Mai Tai') {
            this.currentOrderGlass = 'Lowball';
        } else if (randomCocktail === 'Americano') {
            this.currentOrderGlass = 'Lowball';
        } else if (randomCocktail === 'Mojito') {
            this.currentOrderGlass = 'Highball';
        } else if (randomCocktail === 'Gin Fizz') {
            this.currentOrderGlass = 'Lowball';
        } else if (randomCocktail === 'Baby Guinness') {
            this.currentOrderGlass = 'Shot';
        } else {
            this.currentOrderGlass = this.glasses[Math.floor(Math.random() * this.glasses.length)];
        }
        this.currentOrderIngredients = this.getIngredientsForCocktail(randomCocktail);
        return randomCocktail;
    }
    getIngredientsForCocktail(cocktail) {
        if (cocktail === 'Whiskey Sour') {
            return ['Whiskey', 'Simple Syrup', 'Egg White', 'Bitters', 'Lemon'];
        } else if (cocktail === 'Espresso Martini') {
            return ['Vodka', 'Espresso', 'Kahlua'];
        } else if (cocktail === 'Martini') {
            return ['Gin', 'Vermouth'];
        } else if (cocktail === 'Moscow Mule') {
            return ['Vodka', 'Ginger beer', 'Lime'];
        } else if (cocktail === 'Caipirinha') {
            return ['Cachaça', 'Lime', 'Simple Syrup'];
        } else if (cocktail === 'Aperol Spritz') {
            return ['Aperol', 'Prosecco', 'Soda'];
        } else if (cocktail === 'Margarita') {
            return ['Tequila', 'Cointreau', 'Lime'];
        } else if (cocktail === 'Passion Fruit Martini') {
            return ['Vodka', 'Passion fruit-j', 'Passoa', 'Simple Syrup', 'Lime', 'Passion fruit'];
        } else if (cocktail === 'Old Fashioned') {
            return ['Whiskey', 'Bitters', 'Simple Syrup'];
        } else if (cocktail === 'Gin Bramble') {
            return ['Gin', 'Simple Syrup', 'Blackberry Liqueur', 'Lemon'];
        } else if (cocktail === 'Cosmopolitan') {
            return ['Vodka', 'Cointreau', 'Lime', 'Cranberry Juice'];
        } else if (cocktail === 'Negroni') {
            return ['Gin', 'Vermouth', 'Campari'];
        } else if (cocktail === 'Paloma') {
            return ['Tequila', 'Lime', 'Grapefruit Soda'];
        } else if (cocktail === 'Piña Colada') {
            return ['Rum', 'Pineapple Juice', 'Coconut Cream'];
        } else if (cocktail === 'Gin and Tonic') {
            return ['Gin', 'Soda', 'Lime'];
        } else if (cocktail === 'Manhattan') {
            return ['Whiskey', 'Vermouth', 'Cherry', 'Bitters'];
        } else if (cocktail === 'Campari Spritz') {
            return ['Campari', 'Prosecco', 'Soda', 'Orange slice'];
        } else if (cocktail === 'Bloody Mary') {
            return ['Vodka', 'Tomato juice', 'Lemon', 'Tabasco', 'Worcestershire sauce', 'Salt', 'Pepper'];
        } else if (cocktail === 'Mai Tai') {
            return ['Rum', 'Orgeat', 'Cointreau', 'Simple Syrup', 'Lime'];
        } else if (cocktail === 'Americano') {
            return ['Campari', 'Vermouth', 'Soda', 'Orange slice'];
        } else if (cocktail === 'Mojito') {
            return ['Mint', 'Rum', 'Simple Syrup', 'Soda', 'Lime'];
        } else if (cocktail === 'Gin Fizz') {
            return ['Gin', 'Lemon', 'Egg White', 'Simple Syrup', 'Soda'];
        } else if (cocktail === 'Baby Guinness') {
            return ['Baileys', 'Kahlua'];
        } else if (cocktail === 'Daiquiri') {
            return ['Rum', 'Simple Syrup', 'Lime'];
        } else {
            // For other cocktails, keep the random selection
            const ingredientCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 ingredients
            return this.ingredients.sort(() => 0.5 - Math.random()).slice(0, ingredientCount);
        }
    }
    generateNewOrder() {
        // Reset all buttons to their original colors
        Object.values(this.glassButtons).forEach(button => {
            button.setFillStyle(0x87CEEB);
        });
        Object.values(this.ingredientButtons).forEach(button => {
            button.setFillStyle(0x90EE90);
        });
        // Reset selected glass and selected ingredients
        this.selectedGlass = null;
        this.selectedIngredients.clear();
        // Generate a new order
        this.currentOrder = this.generateRandomOrder();
        this.orderDisplay.setText(`Current Order: ${this.currentOrder}`);
        this.orderDisplay.setPosition(this.cameras.main.width / 2, 50);
        // Reset the currentOrderIngredients
        this.currentOrderIngredients = this.getIngredientsForCocktail(this.currentOrder);
        console.log(`New order generated: ${this.currentOrder}`);
        // Flash effects
        this.flashText(this.orderDisplay);
        this.flashText(this.glassTitle);
        this.flashText(this.ingredientsTitle);
    }
    createCelebrationEffect() {
        // Create flashing effect
        const flashRect = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xffffff);
        flashRect.setAlpha(0);
        flashRect.setOrigin(0);
        this.tweens.add({
            targets: flashRect,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                flashRect.destroy();
            }
        });

        // Create laser flash effect
        this.createLaserFlashEffect();
    }
    createLaserFlashEffect() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const thickness = 4;
        const color = 0x00ff00; // Bright green color for the laser
        // Create four rectangles for each side of the screen
        const top = this.add.rectangle(0, 0, width, thickness, color).setOrigin(0, 0);
        const right = this.add.rectangle(width, 0, thickness, height, color).setOrigin(1, 0);
        const bottom = this.add.rectangle(0, height, width, thickness, color).setOrigin(0, 1);
        const left = this.add.rectangle(0, 0, thickness, height, color).setOrigin(0, 0);
        const borders = [top, right, bottom, left];
        borders.forEach(border => border.setAlpha(0));
        // Animate the laser flash
        this.tweens.add({
            targets: borders,
            alpha: 1,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                borders.forEach(border => border.destroy());
            }
        });
    }
    flashText(textObject) {
        this.tweens.add({
            targets: textObject,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            yoyo: true,
            repeat: 2
        });
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: 800,
    height: 600,
    scene: Example
};

window.phaserGame = new Phaser.Game(config);
