 const stage = document.getElementById('stage');
        const newArrBtn = document.getElementById('newArrBtn');
        const startBtn = document.getElementById('startBtn');
        const numbersInput = document.getElementById('numbers');
        const algorithmSelect = document.getElementById('algorithm');
        const speedSlider = document.getElementById('speedSlider');
        const speedVal = document.getElementById('speedVal');

        const compCount = document.getElementById('compCount');
        const swapCount = document.getElementById('swapCount');
        const timeCount = document.getElementById('timeCount');

        let array = [];
        let animationSpeed = 30;
        let isRunning = false;
        let timerInterval = null;

        speedSlider.addEventListener('input', (e) => {
            animationSpeed = Number(e.target.value);
            speedVal.innerText = animationSpeed;
        });

        window.addEventListener('DOMContentLoaded', () => generateNewArray());
        newArrBtn.addEventListener('click', () => { if (!isRunning) generateNewArray(); });
        startBtn.addEventListener('click', () => { if (!isRunning) runVisualization(); });

        function generateNewArray() {
            const raw = numbersInput.value.trim();
            if (raw !== '') {
                const parts = raw.split(',');
                const parsed = [];
                for (let p of parts) {
                    const trimmed = p.trim();
                    const num = Number(trimmed);
                    

                    if (trimmed === '' || isNaN(num) || num <= 0) {
                        alert(`Invalid token "${p}". Please enter valid positive numbers separated by commas.`);
                        return false;
                    }
                    parsed.push(num);
                }
                if (parsed.length > 50) {
                    alert('Please keep datasets under 50 elements for proper visualization scaling.');
                    return false;
                }
                array = parsed;
            } else {
                array = [];
                for (let i = 0; i < 25; i++) {
                    array.push(Math.floor(Math.random() * 95) + 10);
                }
            }
            renderBars();
            resetTelemetry();
            return true;
        }

        function renderBars(highlights = {}) {
            stage.innerHTML = '';
            const maxVal = Math.max(...array, 100);
            array.forEach((val, idx) => {
                const bar = document.createElement('div');
                bar.classList.add('bar');
                bar.style.height = `${(val / maxVal) * 100}%`;
                
                if (highlights.compare && highlights.compare.includes(idx)) {
                    bar.style.backgroundColor = 'var(--compare)';
                } else if (highlights.swap && highlights.swap.includes(idx)) {
                    bar.style.backgroundColor = 'var(--swap)';
                } else if (highlights.sorted && highlights.sorted.includes(idx)) {
                    bar.style.backgroundColor = '#38bdf8';
                }
                stage.appendChild(bar);
            });
        }

        async function runVisualization() {
            // Re-validate custom inputs on click just in case
            if (!generateNewArray()) return;

            isRunning = true;
            toggleControls(true);
            resetTelemetry();

            const algo = algorithmSelect.value;
            let comps = 0;
            let swaps = 0;
            
            // Start live timer ticking the exact moment visualization begins
            const startTime = performance.now();
            timerInterval = setInterval(() => {
                const elapsed = (performance.now() - startTime) / 1000;
                timeCount.innerText = elapsed.toFixed(2) + 's';
            }, 50);

            if (algo === 'bubble') {
                let n = array.length;
                for (let i = 0; i < n - 1; i++) {
                    for (let j = 0; j < n - i - 1; j++) {
                        renderBars({ compare: [j, j + 1] });
                        await sleep(animationSpeed);
                        comps++;
                        compCount.innerText = comps;

                        if (array[j] > array[j + 1]) {
                            let temp = array[j];
                            array[j] = array[j + 1];
                            array[j + 1] = temp;
                            swaps++;
                            swapCount.innerText = swaps;
                            renderBars({ swap: [j, j + 1] });
                            await sleep(animationSpeed);
                        }
                    }
                }
            } else if (algo === 'selection') {
                let n = array.length;
                for (let i = 0; i < n; i++) {
                    let minIdx = i;
                    for (let j = i + 1; j < n; j++) {
                        renderBars({ compare: [minIdx, j] });
                        await sleep(animationSpeed);
                        comps++;
                        compCount.innerText = comps;

                        if (array[j] < array[minIdx]) {
                            minIdx = j;
                        }
                    }
                    if (minIdx !== i) {
                        let temp = array[i];
                        array[i] = array[minIdx];
                        array[minIdx] = temp;
                        swaps++;
                        swapCount.innerText = swaps;
                        renderBars({ swap: [i, minIdx] });
                        await sleep(animationSpeed);
                    }
                }
            } else if (algo === 'insertion') {
                let n = array.length;
                for (let i = 1; i < n; i++) {
                    let key = array[i];
                    let j = i - 1;
                    while (j >= 0 && array[j] > key) {
                        renderBars({ compare: [j, j + 1] });
                        await sleep(animationSpeed);
                        comps++;
                        compCount.innerText = comps;

                        array[j + 1] = array[j];
                        j--;
                        swaps++;
                        swapCount.innerText = swaps;
                        renderBars({ swap: [j + 1, j + 2] });
                        await sleep(animationSpeed);
                    }
                    array[j + 1] = key;
                }
            }

            // Stop the live timer and lock in the final exact timestamp
            clearInterval(timerInterval);
            const finalTime = (performance.now() - startTime) / 1000;
            timeCount.innerText = finalTime.toFixed(2) + 's';

            // Clean finish celebration highlight
            let allIndices = array.map((_, idx) => idx);
            renderBars({ sorted: allIndices });

            isRunning = false;
            toggleControls(false);
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        function toggleControls(locked) {
            newArrBtn.disabled = locked;
            startBtn.disabled = locked;
            numbersInput.disabled = locked;
            algorithmSelect.disabled = locked;
            speedSlider.disabled = locked;
        }

        function resetTelemetry() {
            if (timerInterval) clearInterval(timerInterval);
            compCount.innerText = '0';
            swapCount.innerText = '0';
            timeCount.innerText = '0.00s';
        }
