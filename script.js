document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('quoteForm');
    const priceDisplay = document.getElementById('estimatedPrice');
    const moveTypeSelect = document.getElementById('moveType');
    const truckSelection = document.getElementById('truckSelection');
    const truckTypeSelect = document.getElementById('truckType');

    const TRUCK_PRICES = {
        '1.75': { min: 1500, max: 2000 },
        '3.5': { min: 2800, max: 3300 },
        '4': { min: 5500, max: 7000 },
        '4.5': { min: 7000, max: 8500 },
        '5': { min: 14000, max: 17500 }
    };

    const MOVE_TYPE_PRICES = {
        'student': { min: 1500, max: 2000 },
        'family': { min: 2800, max: 3300 }
    };

    const ADDITIONAL_SERVICES = {
        furniture: { min: 500, max: 6000 },
        packing: { min: 3000, max: 10000 },
        garbage: { min: 8000, max: 1500 },
        crane: { min: 3000, max: 3000 }
    };

    // 監聽搬家分類的變化
    moveTypeSelect.addEventListener('change', function() {
        console.log('Move type changed:', this.value); // 調試用
        if (this.value === 'custom') {
            truckSelection.style.display = 'block';
            truckTypeSelect.required = true;
        } else {
            truckSelection.style.display = 'none';
            truckTypeSelect.required = false;
            truckTypeSelect.value = '';
        }
        calculatePrice();
    });

    // 監聽車型選擇的變化
    truckTypeSelect.addEventListener('change', function() {
        console.log('Truck type changed:', this.value); // 調試用
        calculatePrice();
    });

    function calculatePrice() {
        console.log('Calculating price...'); // 調試用

        // 獲取基本價格
        let minPrice = 0;
        let maxPrice = 0;
        const moveType = moveTypeSelect.value;
        const truckType = truckTypeSelect.value;

        console.log('Move type:', moveType); // 調試用
        console.log('Truck type:', truckType); // 調試用

        // 設定基本價格
        if (moveType === 'custom' && truckType) {
            minPrice = TRUCK_PRICES[truckType].min;
            maxPrice = TRUCK_PRICES[truckType].max;
        } else if (MOVE_TYPE_PRICES[moveType]) {
            minPrice = MOVE_TYPE_PRICES[moveType].min;
            maxPrice = MOVE_TYPE_PRICES[moveType].max;
        }

        console.log('Base price:', minPrice, maxPrice); // 調試用

        // 獲取樓層和電梯信息（使用更安全的選擇器）
        const fromFloorInput = document.querySelector('input[name="fromFloor"]');
        const toFloorInput = document.querySelector('input[name="toFloor"]');
        const fromFloor = fromFloorInput ? (parseInt(fromFloorInput.value) || 0) : 0;
        const toFloor = toFloorInput ? (parseInt(toFloorInput.value) || 0) : 0;
        const fromElevator = document.querySelector('input[name="fromElevator"]')?.checked || false;
        const toElevator = document.querySelector('input[name="toElevator"]')?.checked || false;

        console.log('Floor info:', fromFloor, toFloor, fromElevator, toElevator); // 調試用

        // 計算樓層費用
        if (!fromElevator && fromFloor > 1) {
            const floorCharge = (fromFloor - 1) * 300;
            minPrice += floorCharge;
            maxPrice += floorCharge;
        }
        if (!toElevator && toFloor > 1) {
            const floorCharge = (toFloor - 1) * 300;
            minPrice += floorCharge;
            maxPrice += floorCharge;
        }

        // 計算步行距離費用（使用更安全的選擇器）
        const walkingDistanceInput = document.querySelector('input[name="walkingDistance"]');
        const walkingDistance = walkingDistanceInput ? (parseInt(walkingDistanceInput.value) || 0) : 0;
        if (walkingDistance > 20) {
            const extraDistance = Math.ceil((walkingDistance - 20) / 20);
            const distanceCharge = extraDistance * 500;
            minPrice += distanceCharge;
            maxPrice += distanceCharge;
        }

        // 計算額外服務費用
        const services = document.querySelectorAll('input[name="additionalServices"]:checked');
        services.forEach(service => {
            const serviceType = service.value;
            if (ADDITIONAL_SERVICES[serviceType]) {
                minPrice += ADDITIONAL_SERVICES[serviceType].min;
                maxPrice += ADDITIONAL_SERVICES[serviceType].max;
            }
        });

        console.log('Final price:', minPrice, maxPrice); // 調試用

        // 更新主要價格顯示
        if (!moveType) {
            priceDisplay.textContent = "請選擇搬家分類";
            document.getElementById('floatingPrice').textContent = "請選擇搬家分類";
        } else if (moveType === 'custom' && !truckType) {
            priceDisplay.textContent = "請選擇車種";
            document.getElementById('floatingPrice').textContent = "請選擇車種";
        } else {
            const priceText = `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
            priceDisplay.textContent = priceText;
            document.getElementById('floatingPrice').textContent = priceText;
        }
    }

    // 監聽所有表單變化
    form.addEventListener('input', calculatePrice);
    form.addEventListener('change', calculatePrice);

    // Tippy 初始化
    tippy('[data-tippy-content]', {
        placement: 'top',
        arrow: true,
        theme: 'light'
    });
});

function copyEstimate() {
    // 基本搬家資訊
    const moveType = document.getElementById('moveType').value;
    const moveTypeText = moveType === 'student' ? '學生搬家' : 
                        moveType === 'family' ? '小家庭搬家' : 
                        moveType === 'custom' ? '自選車種' : '';
    
    // 車種資訊（如果是自選車種）
    const truckType = document.getElementById('truckType')?.value || '';
    const truckTypeText = moveType === 'custom' ? `\n車種選擇：${truckType}噸貨車` : '';

    // 樓層和電梯資訊
    const fromFloor = document.querySelector('input[name="fromFloor"]')?.value || '';
    const toFloor = document.querySelector('input[name="toFloor"]')?.value || '';
    const fromElevator = document.querySelector('input[name="fromElevator"]')?.checked;
    const toElevator = document.querySelector('input[name="toElevator"]')?.checked;
    
    // 步行距離
    const walkingDistance = document.querySelector('input[name="walkingDistance"]')?.value || '0';
    
    // 額外服務
    const additionalServices = Array.from(document.querySelectorAll('input[name="additionalServices"]:checked'))
        .map(input => input.parentElement.textContent.trim());
    
    // 預估價格
    const price = document.getElementById('floatingPrice').textContent;

    // 聯絡資訊
    const contactName = document.getElementById('contactName')?.value || '未填寫';
    const contactPhone = document.getElementById('contactPhone')?.value || '未填寫';
    const contactLine = document.getElementById('contactLine')?.value || '未填寫';
    const contactNote = document.getElementById('contactNote')?.value || '無';

    // 格式化文字
    const textToCopy = `
樂遷搬家 - 搬家詢價資訊
======================
【基本資訊】
搬家類型：${moveTypeText}${truckTypeText}
搬出樓層：${fromFloor}樓 ${fromElevator ? '(有電梯)' : '(無電梯)'}
搬入樓層：${toFloor}樓 ${toElevator ? '(有電梯)' : '(無電梯)'}
步行距離：${walkingDistance}公尺

【額外服務】
${additionalServices.length > 0 ? additionalServices.join('\n') : '無'}

【預估費用】
${price}

【聯絡資訊】
姓名：${contactName}
電話：${contactPhone}
LINE：${contactLine}
備註說明：${contactNote}
======================
`.trim();

    // 複製到剪貼板
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            const buttonContent = document.querySelector('.copy-button-content');
            if (buttonContent) {
                const originalContent = buttonContent.innerHTML;
                buttonContent.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    已複製詢價資訊
                `;

                setTimeout(() => {
                    buttonContent.innerHTML = originalContent;
                }, 2000);
            }
        })
        .catch(err => {
            console.log('複製時發生錯誤:', err);
            try {
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            } catch (fallbackErr) {
                console.log('備用複製方法也失敗:', fallbackErr);
            }
        });
} 