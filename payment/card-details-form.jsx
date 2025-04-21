import React, { useState } from "react"
import { View, Text, TextInput, StyleSheet } from "react-native"

const CardDetailsForm = () => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  })

  const [errors, setErrors] = useState({})

  const handleChange = (name, value) => {
    let updatedValue = value

    if (name === "cardNumber") {
      updatedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19)

      setCardDetails({ ...cardDetails, [name]: updatedValue })

      if (updatedValue.replace(/\s/g, "").length > 0 && !/^\d{4}\s\d{4}\s\d{4}\s\d{0,4}$/.test(updatedValue)) {
        setErrors({ ...errors, [name]: "Please enter a valid card number" })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
      return
    }

    if (name === "expiryDate") {
      updatedValue = value
        .replace(/\//g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .slice(0, 5)

      setCardDetails({ ...cardDetails, [name]: updatedValue })

      if (updatedValue.length > 0 && !/^\d{2}\/\d{2}$/.test(updatedValue)) {
        setErrors({ ...errors, [name]: "Please enter a valid date (MM/YY)" })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
      return
    }

    setCardDetails({ ...cardDetails, [name]: updatedValue })

    if (name === "cvv") {
      if (value.length > 0 && !/^\d{3,4}$/.test(value)) {
        setErrors({ ...errors, [name]: "CVV must be 3 or 4 digits" })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
    }

    if (name === "cardholderName") {
      if (value.length > 0 && value.length < 3) {
        setErrors({ ...errors, [name]: "Please enter a valid name" })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Card Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          value={cardDetails.cardNumber}
          onChangeText={(text) => handleChange("cardNumber", text)}
          style={[styles.input, errors.cardNumber && styles.errorInput]}
        />
        {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
      </View>

      {/* Cardholder Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          placeholder="John Doe"
          value={cardDetails.cardholderName}
          onChangeText={(text) => handleChange("cardholderName", text)}
          style={[styles.input, errors.cardholderName && styles.errorInput]}
        />
        {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
      </View>

      {/* Expiry Date & CVV */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.half]}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            placeholder="MM/YY"
            keyboardType="numeric"
            value={cardDetails.expiryDate}
            onChangeText={(text) => handleChange("expiryDate", text)}
            style={[styles.input, errors.expiryDate && styles.errorInput]}
          />
          {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
        </View>

        <View style={[styles.inputGroup, styles.half]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            placeholder="123"
            maxLength={4}
            keyboardType="numeric"
            value={cardDetails.cvv}
            onChangeText={(text) => handleChange("cvv", text)}
            style={[styles.input, errors.cvv && styles.errorInput]}
          />
          {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  half: {
    flex: 1,
    marginRight: 8,
  },
})

export default CardDetailsForm
