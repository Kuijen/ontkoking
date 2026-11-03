<main id="main">

    <section class="hero">
        <div class="hero-inner">
            <div>
                <h1>Stop de <em>ontkoking</em></h1>
                <p>Ontdek recepten van de community, bewaar je favorieten en deel je eigen gerechten. Gewoon eten dat klopt, zonder overgekookte groenten.</p>
                <a href="recepten.php" class="btn btn-primary">Bekijk alle recepten</a>
            </div>
            <img class="hero-img" src="img/champings.jpg" alt="Een gerecht uit de community">
        </div>
    </section>

    <section class="searchbar">
        <div class="searchbar-inner">
            <form class="search-row" action="recepten.php" method="get" role="search">
                <label class="visually-hidden" for="search">Zoek recepten</label>
                <input class="input" type="search" id="search" name="q" placeholder="Zoek op titel of ingrediënt…">
                <button class="btn btn-primary" type="submit">Zoeken</button>
            </form>

            <div class="quick-filters">
                <span>Snel filteren:</span>
                <a class="chip" href="recepten.php?tag=budget">#Budget</a>
                <a class="chip" href="recepten.php?tag=snel">#Snel</a>
                <a class="chip" href="recepten.php?tag=vega">#Vega</a>
                <a class="chip" href="recepten.php?tag=diner">#Diner</a>
            </div>
        </div>
    </section>

    <div class="container">
        <section class="section" aria-labelledby="featured">
            <div class="section-heading">
                <h2 id="featured">Uitgelichte recepten</h2>
                <a href="recepten.php">Alles bekijken</a>
            </div>

<?php if ($recipes): ?>
            <div class="grid">
<?php foreach ($recipes as $recipe): ?>
<?php include __DIR__ . '/partials/recipe-card.php'; ?>
<?php endforeach; ?>
            </div>
<?php else: ?>
            <p class="muted">Er zijn nog geen recepten gepubliceerd.</p>
<?php endif; ?>
        </section>
    </div>

</main>
