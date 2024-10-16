const token = 'TOKEN'
const projectsContainer = document.getElementById('projects-container');
const contributionsContainer = document.getElementById('contributions-container');

// Map for language icons
const languageIcons = {
  'JavaScript': 'devicon-javascript-plain colored',
  'Lua': 'devicon-lua-plain colored',
  'HTML': 'devicon-html5-plain colored',
  'CSS': 'devicon-css3-plain colored',
  'Python': 'devicon-python-plain colored',
  'Java': 'devicon-java-plain colored',
  'C': 'devicon-c-plain colored',
  'C++': 'devicon-cplusplus-plain colored',
  'C#': 'devicon-csharp-plain colored',
  'Ruby': 'devicon-ruby-plain colored',
  'PHP': 'devicon-php-plain colored',
  'Go': 'devicon-go-plain colored',
  'Swift': 'devicon-swift-plain colored',
  'Kotlin': 'devicon-kotlin-plain colored',
  'TypeScript': 'devicon-typescript-plain colored',
  'R': 'devicon-r-plain colored',
  'Dart': 'devicon-dart-plain colored',
  'Scala': 'devicon-scala-plain colored',
  'Objective-C': 'devicon-objectivec-plain colored',
  'Shell': 'devicon-bash-plain colored',
  'Perl': 'devicon-perl-plain colored',
  'Elixir': 'devicon-elixir-plain colored',
  'Haskell': 'devicon-haskell-plain colored',
  'Groovy': 'devicon-groovy-plain colored',
  'Visual Basic': 'devicon-visualstudio-plain colored',
  'COBOL': 'devicon-cobol-plain colored',
  'Fortran': 'devicon-fortran-plain colored',
  'Rust': 'devicon-rust-plain colored',
};

// Function to create a project card
function createProjectCard(project, languages) {
  const primaryLanguage = Object.keys(languages)[0] || 'Code';
  const languageIcon = languageIcons[primaryLanguage] || 'devicon-devicon-plain';
  const totalUsage = Object.values(languages).reduce((a, b) => a + b, 0);
  const primaryLanguageUsage = languages[primaryLanguage] || 0;
  const usagePercentage = ((primaryLanguageUsage / totalUsage) * 100).toFixed(2);

  const projectCard = document.createElement('div');
  projectCard.classList.add('project-card');
  projectCard.innerHTML = `
    <a href="${project.html_url}" target="_blank">
      <h3>${project.name}</h3>
      <p>${project.description || 'Aucune description disponible.'}</p>
      <div class="project-stats">
        <span><i class="fas fa-star"></i> ${project.stargazers_count} Stars</span>
        <span><i class="fas fa-code-branch"></i> ${project.forks_count} Forks</span>
      </div>
      <div class="project-languages">
        <i class="${languageIcon}"></i> ${primaryLanguage} (${usagePercentage}%)
      </div>
    </a>
  `;

  setTimeout(() => projectCard.classList.add('appear'), 100);
  fetchContributors(project, projectCard);
  projectsContainer.appendChild(projectCard);
}

// Fetch all projects using the GitHub API
fetch(`https://api.github.com/users/Kamionn/repos?sort=created&per_page=100`, { headers: { 'Authorization': `token ${token}` } })
  .then(response => response.json())
  .then(data => {
    data.forEach(project => {
      fetch(project.languages_url, { headers: { 'Authorization': `token ${token}` } })
        .then(response => response.json())
        .then(languages => createProjectCard(project, languages))
        .catch(error => console.error('Erreur lors de la récupération des langages:', error));
    });
  })
  .catch(error => console.error('Erreur lors de la récupération des projets:', error));

// Fetch recent contributions
fetch(`https://api.github.com/users/Kamionn/events`, { headers: { 'Authorization': `token ${token}` } })
  .then(response => response.json())
  .then(events => {
    const contributions = events.filter(event => ['PushEvent', 'PullRequestEvent', 'CreateEvent'].includes(event.type));
    if (contributionsContainer) {
      contributionsContainer.innerHTML = contributions.length
        ? '<h2>Dernières Contributions</h2>' + contributions.slice(0, 5).map(event => {
            const contributionDate = new Date(event.created_at).toLocaleString();
            const repoName = event.repo.name;
            const commitCount = event.payload.commits ? event.payload.commits.length : 0;
            return `<p>${repoName} - ${commitCount} commit(s) le ${contributionDate}</p>`;
          }).join('')
        : '<p>Aucune contribution récente.</p>';
    }
  })
  .catch(error => console.error('Erreur lors de la récupération des contributions:', error));

// Function to fetch and display contributors of a project
function fetchContributors(project, projectCard) {
  fetch(`${project.contributors_url}`, { headers: { 'Authorization': `token ${token}` } })
    .then(response => response.json())
    .then(contributors => {
      if (contributors.length > 0) {
        const { login: topContributor, avatar_url: contributorAvatar } = contributors[0];
        const contributorsSection = document.createElement('div');
        contributorsSection.classList.add('contributors-section');
        contributorsSection.innerHTML = `
          <div class="contributor">
            <img src="${contributorAvatar}" alt="${topContributor}" class="contributor-avatar">
            <span>${topContributor}</span>
          </div>
        `;
        projectCard.appendChild(contributorsSection);
      }
    })
    .catch(error => console.error('Erreur lors de la récupération des contributeurs:', error));
}

// Check API call limit
fetch('https://api.github.com/rate_limit', { headers: { 'Authorization': `token ${token}` } })
  .then(response => response.json())
  .then(data => {
    const remainingRequests = data.rate.remaining;
    console.log(`Il reste ${remainingRequests} appels API avant de dépasser la limite.`);
    if (remainingRequests === 0) {
      alert('La limite d\'appels à l\'API GitHub est atteinte. Réessayez plus tard.');
    }
  })
  .catch(error => console.error('Erreur lors de la vérification de la limite d\'API:', error));
