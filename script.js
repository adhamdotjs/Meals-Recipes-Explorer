let categoryMenu = document.querySelector("#category");
let cards = document.querySelector(".cards");
let dataPopUp = document.querySelector(".overlay");

//! Get Categories Into Drop Down Menu
async function getCategories() {
	try {
		let data = await fetch(
			"https://www.themealdb.com/api/json/v1/1/list.php?c=list"
		);
		data = await data.json();
		data.meals.forEach((category) => {
			categoryMenu.innerHTML += `<option value="${category.strCategory}">${category.strCategory}</option>`;
		});
	} catch (error) {
		console.log("Error");
	}

	if (localStorage.getItem("categoryName")) {
		categoryMenu.value = localStorage.getItem("categoryName");
	}
}
getCategories();

categoryMenu.addEventListener("input", (e) => {
	localStorage.setItem("categoryName", categoryMenu.value);
	cards.innerHTML = "";
	getMeals().then(() => {
		//! Auto Scroll To Cards That I choose Its Category
		cards.scrollIntoView({ behavior: "smooth", block: "start" });
	});
	cards.scrollIntoView({ behavior: "smooth", block: "start" });
});
getMeals();

//! Get Meals In Cards
async function getMeals() {
	let data = await fetch(
		`https://www.themealdb.com/api/json/v1/1/filter.php?c=${localStorage.getItem(
			"categoryName"
		)}`
	);
	data = await data.json();
	showCards(data.meals);
}

let ingredients = [];
let measures = [];

//! Create Meal Details Of Clicked Meal Card
async function getMealDetails(mealId) {
	let data = await fetch(
		`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
	);
	data = await data.json();
	data.meals.forEach((meal) => {
		dataPopUp.innerHTML = `
      <div class="container">
        <div class="meal-data">
          <button class="close"><i class="fa-solid fa-xmark"></i></button>
          <h1 class="title">${meal.strMeal}</h1>
          <div class="root">
            <span>Category: ${meal.strCategory}</span>
            <span>Area: ${meal.strArea}</span>
          </div>
          <img src="${meal.strMealThumb}" alt="Meal" loading="lazy">
          <div class="ingredients">
            <h5>📖Ingredients:</h5>
            <ul></ul>
          </div>
          <div class="instructions">
            <h5>👩‍🍳Instructions:</h5>
            <p>${meal.strInstructions}</p>
          </div>
          ${
						meal.strYoutube
							? `<div class="link">
                  <a href="${meal.strYoutube}" target="_blank" class="youtube">Watch Video Recipe on Youtube🎥</a>
                </div> `
							: ""
					}
        </div>
      </div>
    `;
		//! Collect Ingredients And Measures In Arrays
		for (let i = 1; i <= 20; i++) {
			let ing = meal[`strIngredient${i}`];
			let measure = meal[`strMeasure${i}`];
			if (ing && ing.trim() && measure && measure.trim() !== false) {
				ingredients.push(ing);
				measures.push(measure);
			}
		}
		//! Add Ingredients To Meal Details (Overlay)
		for (let i = 0; i < ingredients.length; i++) {
			let ul = document.querySelector(".ingredients ul");
			ul.innerHTML += `<li>${measures[i]} ${ingredients[i]}</li>`;
		}

		//! Close Meal Details (Overlay)
		let closeBtn = document.querySelector(".close");
		closeBtn.addEventListener("click", (e) => {
			dataPopUp.classList.add("hidden");
		});
	});
}

//! Search
let search = document.querySelector("[type='search']");
search.addEventListener("input", async (e) => {
	let data = await fetch(
		`https://www.themealdb.com/api/json/v1/1/search.php?f=${search.value}`
	);
	data = await data.json();
	if (search.value !== "") {
		cards.innerHTML = "";
		showCards(data.meals);
	} else {
		cards.innerHTML = "";
		getMeals();
	}
	//! Auto Scroll To Cards That I Search For
	cards.scrollIntoView({ behavior: "smooth", block: "start" });
});

//! Show Cards
function showCards(dataMeals) {
	dataMeals.forEach((meal) => {
		let title = meal.strMeal;
		title = title.length >= 20 ? `${title.slice(0, 20)}...` : title;
		cards.innerHTML += `
      <div class="card" data-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="Meal" loading="lazy">
        <p>${title}</p>
      </div>`;
	});

	let cardsData = document.querySelectorAll(".cards .card");
	[...cardsData].forEach((card) => {
		card.addEventListener("click", (e) => {
			dataPopUp.innerHTML = "";
			let mealId = card.dataset.id;
			getMealDetails(mealId);
			dataPopUp.classList.remove("hidden");
		});
	});
}
