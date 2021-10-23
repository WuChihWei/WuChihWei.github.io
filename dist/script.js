const movies = [
  {
    title: "The Avengers",
    image: "https://bit.ly/2NQOG6H",
    rating: 0
  },
  {
    title: "Our Times",
    image: "https://bit.ly/2OsGmv2",
    rating: 0
  },
  {
    title: "Aquaman",
    image:
      "https://assets-lighthouse.alphacamp.co/uploads/image/file/15303/AquamanPoster.jpg",
    rating: 0
  }
];

// functions
// input items
const datapanel = document.querySelector("#data-panel");
function displaymovie(movies) {
  let htmlcontent = `
        <table class="table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Rating</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
      `;
  movies.forEach((movie) => {
    htmlcontent += `
        <tr>
          <td>
            <img src = ${movie.image} width = "70" class="img-thumbnail" >
          </td>
          <td>${movie.title}</td>
          <td>
            <span class="fa fa-thumbs-up"></span>
            <span class="fa fa-thumbs-down px-2"></span>
            <span id="rating">${movie.rating}</span>
          </td>
          <td>
            <button class="btn btn-sm btn-danger">X</button>
          </td>
        </tr>
      `;
  });

  htmlcontent += `</tbody>
      </table>`;

  return htmlcontent;
}

// button effect
const buttonEffect = function (event) {
  const target = event.target;
  let rating = target.parentElement.children[2];

  // thumbs-up event
  if (target.classList.contains("fa-thumbs-up")) {
    rating.innerHTML = parseInt(rating.innerHTML) + 1;

    // thumbs-down event
  } else if (target.classList.contains("fa-thumbs-down")) {
    if (parseInt(rating.innerHTML) > 0) {
      rating.innerHTML = parseInt(rating.innerHTML) - 1;
    }

    // remove event
  } else if (target.classList.contains("btn")) {
    const tr = target.parentElement.parentElement;
    tr.remove();
  }
};

datapanel.innerHTML = displaymovie(movies);
datapanel.addEventListener("click", buttonEffect);