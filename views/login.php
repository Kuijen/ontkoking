<main class="login-page">
    <div class="login-box login-box-wide">

        <header class="login-logo">
            <h1>GLR <span>Food Freaks</span></h1>
            <p>Stop de ontkoking</p>
        </header>

        <div class="auth-grid">

            <section class="card" aria-labelledby="login">
                <form class="login-form" action="login.php" method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="form" value="login">
                    <input type="hidden" name="next" value="<?= e($next) ?>">
                    <h2 id="login">Inloggen</h2>
<?php if ($errors['login']): ?>
                    <div class="form-alert" role="alert"><?= e($errors['login']) ?></div>
<?php endif; ?>

                    <div class="field">
                        <label for="username">Gebruikersnaam</label>
                        <input type="text" id="username" name="username" class="input" placeholder="jouwgebruikersnaam" autocomplete="username" value="<?= e($old['username']) ?>" required>
                    </div>

                    <div class="field">
                        <label for="password">Wachtwoord</label>
                        <input type="password" id="password" name="password" class="input" placeholder="••••••••" autocomplete="current-password" required>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">Inloggen</button>
                </form>
            </section>

            <section class="card" aria-labelledby="register">
                <form class="login-form" action="login.php" method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="form" value="register">
                    <input type="hidden" name="next" value="<?= e($next) ?>">
                    <h2 id="register">Account aanmaken</h2>
<?php if ($errors['register']): ?>
                    <div class="form-alert" role="alert"><?= e($errors['register']) ?></div>
<?php endif; ?>

                    <div class="field">
                        <label for="newUsername">Gebruikersnaam</label>
                        <input type="text" id="newUsername" name="new_username" class="input" placeholder="Kies een gebruikersnaam" autocomplete="username" value="<?= e($old['new_username']) ?>" required>
                    </div>

                    <div class="field">
                        <label for="newPassword">Wachtwoord</label>
                        <input type="password" id="newPassword" name="new_password" class="input" placeholder="Minimaal 6 tekens" autocomplete="new-password" required minlength="6">
                    </div>

                    <div class="field">
                        <label for="confirm">Bevestig wachtwoord</label>
                        <input type="password" id="confirm" name="confirm" class="input" placeholder="Herhaal je wachtwoord" autocomplete="new-password" required>
                    </div>

                    <button type="submit" class="btn btn-outline btn-block">Account aanmaken</button>
                </form>
            </section>

        </div>
    </div>
</main>
