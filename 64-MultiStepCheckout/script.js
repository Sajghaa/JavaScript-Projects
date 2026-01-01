const stepContent = document.getElementById('stepContent');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const steps = document.querySelectorAll('.step');
const progressBar = document.getElementById('progress');
const checkoutStatePre = document.getElementById('checkoutState');

let currentStep = 1;

let checkoutState = {
    cart: [
        { name: 'Product A', qty: 1, price: 10 },
        { name: 'Product B', qty: 2, price: 15 }
    ],
    address: { name:'', street:'', city:'', zip:'' },
    payment: { cardNumber:'', expiry:'', cvv:'' }
};

function renderStep() {
    steps.forEach(step => step.classList.remove('active'));
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
    progressBar.style.width = `${(currentStep-1)/(steps.length-1)*100}%`;

    if(currentStep===1){
        stepContent.innerHTML = checkoutState.cart.map((item,i)=>`
            <div class="cart-item">
                <span>${item.name} - $${item.price}</span>
                <input type="number" min="1" value="${item.qty}" data-index="${i}" class="cartQty">
            </div>
        `).join('');
        document.querySelectorAll('.cartQty').forEach(input=>{
            input.addEventListener('input', e=>{
                const i = e.target.dataset.index;
                checkoutState.cart[i].qty = parseInt(e.target.value);
                updateState();
            });
        });
    } else if(currentStep===2){
        stepContent.innerHTML = `
            <input type="text" placeholder="Name" value="${checkoutState.address.name}" id="name" required>
            <input type="text" placeholder="Street" value="${checkoutState.address.street}" id="street" required>
            <input type="text" placeholder="City" value="${checkoutState.address.city}" id="city" required>
            <input type="text" placeholder="ZIP" value="${checkoutState.address.zip}" id="zip" required>
        `;
        ['name','street','city','zip'].forEach(id=>{
            document.getElementById(id).addEventListener('input', e=>{
                checkoutState.address[id] = e.target.value;
                updateState();
            });
        });
    } else if(currentStep===3){
        const total = checkoutState.cart.reduce((sum,i)=>sum+i.price*i.qty,0);
        stepContent.innerHTML = `
            <h3>Total: $${total}</h3>
            <input type="text" placeholder="Card Number" value="${checkoutState.payment.cardNumber}" id="cardNumber" required>
            <input type="text" placeholder="Expiry" value="${checkoutState.payment.expiry}" id="expiry" required>
            <input type="text" placeholder="CVV" value="${checkoutState.payment.cvv}" id="cvv" required>
        `;
        ['cardNumber','expiry','cvv'].forEach(id=>{
            document.getElementById(id).addEventListener('input', e=>{
                checkoutState.payment[id] = e.target.value;
                updateState();
            });
        });
    }

    prevBtn.disabled = currentStep===1;
    nextBtn.textContent = currentStep===3?'Finish ✅':'Next ➡';
    updateState();
}

function updateState(){
    checkoutStatePre.textContent = JSON.stringify(checkoutState,null,2);
}

prevBtn.addEventListener('click', ()=>{
    if(currentStep>1){
        currentStep--;
        renderStep();
    }
});
nextBtn.addEventListener('click', ()=>{

    if(currentStep===2){
        const {name,street,city,zip} = checkoutState.address;
        if(!name||!street||!city||!zip){
            alert('Please fill all address fields.');
            return;
        }
    }
    if(currentStep===3){
        const {cardNumber,expiry,cvv} = checkoutState.payment;
        if(!cardNumber||!expiry||!cvv){
            alert('Please fill all payment fields.');
            return;
        }
        alert('Checkout Complete! Check console for final state.');
        console.log('Final State:', checkoutState);
        return;
    }
    currentStep++;
    renderStep();
});

renderStep();
