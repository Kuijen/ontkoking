<?php if (empty($bare)): ?>

    <footer class="site-footer">
        <div class="footer-inner">
            <span>stop de ontkoking.</span>
        </div>
    </footer>
<?php endif; ?>
<?php if ($messages): ?>

    <script>
        setTimeout(function () {
            var stack = document.querySelector('.toast-stack');
            if (stack) stack.remove();
        }, 4000);
    </script>
<?php endif; ?>

</body>
</html>
