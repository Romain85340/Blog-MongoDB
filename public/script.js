const search_input = document.getElementById('search');
const results = document.getElementById('results');
let search_term = '';
let articles;

const fetchArticles = async () => {
    articles = await fetch("http://localhost:1995/api")
    .then(res => res.json())
}
const showArticles =  async () => {
    results.innerHTML = "";
    await fetchArticles()
    
    // console.log(typeof articles);
    // console.log(articles);

    const ul = document.createElement("ul");
    var articlesArray = Array.from(articles);
    
  
    articlesArray
    .filter(
    article => article.title.toLowerCase().includes(search_term.toLowerCase()) 
  )
  .forEach(article => {
    // console.log(article);
		const li = document.createElement('li');
    let article_title = document.createElement('a');
    article_title.innerText = article.title;
    article_title.href = "/pageSingle/" + article.articleId
		li.appendChild(article_title);
    ul.appendChild(li);
	})
	results.appendChild(ul);
}

// showArticles();

search_input.addEventListener('input', (e) => {
    search_term = e.target.value;
    if (search_term.length > 0) {			showArticles();
    } else {
      results.innerHTML = '';
    }
  });
console.log(fetchArticle);
